import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './features/auth/presentation/useAuth';
import { supabase } from './infrastructure/supabase/client';
import { createSupabaseCrmRepository } from './features/crm/infrastructure/supabase/SupabaseCrmRepository';
import { stageColorByKey } from './features/crm/domain/stageColors';
import type { ActivityItem, CrmBundle, Prospect, Stage, Task } from './features/crm/domain/crm';
import type { Device, MobileTab, Screen, Variant } from './types';

const repository = createSupabaseCrmRepository(supabase);

export function money(cents: number): string {
  return (cents / 100).toLocaleString('fr-CA').replace(/,/g, ' ') + ' $';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function stageColor(stageKey: string): string {
  return stageColorByKey(stageKey);
}

interface AppState {
  screen: Screen;
  variant: Variant;
  device: Device;
  loading: boolean;
  loadError: string | null;
  stages: Stage[];
  prospects: Prospect[];
  activity: ActivityItem[];
  tasks: Task[];
  query: string;
  filter: string | 'Tous';
  selectedId: string | null;
  note: string;
  newOpen: boolean;
  fName: string;
  fSub: string;
  fValue: string;
  formError: boolean;
  toast: string | null;
  mTab: MobileTab;
  mStage: string;
}

interface AppActions {
  setScreen: (s: Screen) => void;
  setVariant: (v: Variant) => void;
  setDevice: (d: Device) => void;
  setQuery: (q: string) => void;
  setFilter: (f: string | 'Tous') => void;
  resetFilters: () => void;
  openProspect: (id: string) => void;
  closeDrawer: () => void;
  move: (id: string, dir: 1 | -1) => void;
  setStageOf: (id: string, stageId: string) => void;
  toggleTask: (id: string) => void;
  setNote: (n: string) => void;
  addNote: () => void;
  openNew: () => void;
  closeNew: () => void;
  setFName: (v: string) => void;
  setFSub: (v: string) => void;
  setFValue: (v: string) => void;
  submitNew: () => void;
  approve: () => void;
  askRevision: () => void;
  setMTab: (t: MobileTab) => void;
  setMStage: (s: string) => void;
  showToast: (msg: string) => void;
}

const AppStateContext = createContext<AppState | null>(null);
const AppActionsContext = createContext<AppActions | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const organizationId = session?.memberships[0]?.organizationId ?? null;

  const [screen, setScreen] = useState<Screen>('accueil');
  const [variant, setVariant] = useState<Variant>('A');
  const [device, setDevice] = useState<Device>('desktop');
  const [bundle, setBundle] = useState<CrmBundle>({ stages: [], prospects: [], activities: [], tasks: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string | 'Tous'>('Tous');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [fName, setFName] = useState('');
  const [fSub, setFSub] = useState('');
  const [fValue, setFValue] = useState('');
  const [formError, setFormError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mTab, setMTab] = useState<MobileTab>('home');
  const [mStage, setMStage] = useState<string>('');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const reload = useCallback(async () => {
    if (!organizationId) return;
    try {
      const next = await repository.getBundle(organizationId);
      setBundle(next);
      setMStage((prev) => prev || next.stages[0]?.id || '');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Le CRM n’a pas pu être chargé.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const move = (id: string, dir: 1 | -1) => {
    const item = bundle.prospects.find((p) => p.id === id);
    if (!item) return;
    const stages = [...bundle.stages].sort((a, b) => a.position - b.position);
    const i = stages.findIndex((s) => s.id === item.stageId);
    const n = Math.max(0, Math.min(stages.length - 1, i + dir));
    const nextStage = stages[n];
    if (nextStage.id === item.stageId) return;
    void repository
      .moveStage(id, nextStage.id)
      .then(() => {
        showToast(item.name + ' → ' + nextStage.label);
        void reload();
      })
      .catch((err) => showToast(err instanceof Error ? err.message : 'Action impossible.'));
  };

  const setStageOf = (id: string, stageId: string) => {
    const item = bundle.prospects.find((p) => p.id === id);
    const stage = bundle.stages.find((s) => s.id === stageId);
    if (!item || !stage) return;
    void repository
      .moveStage(id, stageId)
      .then(() => {
        showToast(item.name + ' → ' + stage.label);
        void reload();
      })
      .catch((err) => showToast(err instanceof Error ? err.message : 'Action impossible.'));
  };

  const toggleTask = (id: string) => {
    const t = bundle.tasks.find((x) => x.id === id);
    if (!t) return;
    void repository
      .toggleTask(id, !t.done)
      .then(() => {
        if (!t.done) showToast('Tâche terminée : ' + t.label);
        void reload();
      })
      .catch((err) => showToast(err instanceof Error ? err.message : 'Action impossible.'));
  };

  const addNote = () => {
    if (!organizationId || selectedId == null || !note.trim()) {
      showToast('Écrivez une note avant d’enregistrer');
      return;
    }
    const item = bundle.prospects.find((p) => p.id === selectedId);
    if (!item) return;
    void repository
      .addActivityNote(organizationId, selectedId, item.contactId, note.trim())
      .then(() => {
        setNote('');
        showToast('Activité enregistrée');
        void reload();
      })
      .catch((err) => showToast(err instanceof Error ? err.message : 'Action impossible.'));
  };

  const openNew = () => {
    setNewOpen(true);
    setFormError(false);
  };
  const closeNew = () => {
    setNewOpen(false);
    setFName('');
    setFSub('');
    setFValue('');
    setFormError(false);
  };

  const submitNew = () => {
    if (!fName.trim() || !organizationId) {
      setFormError(true);
      return;
    }
    void repository
      .createProspect(organizationId, {
        name: fName.trim(),
        need: fSub.trim(),
        valueCents: (parseInt(fValue.replace(/\D/g, ''), 10) || 0) * 100,
      })
      .then(() => {
        closeNew();
        showToast('Prospect ajouté à « Nouveau »');
        void reload();
      })
      .catch((err) => showToast(err instanceof Error ? err.message : 'Action impossible.'));
  };

  const state: AppState = {
    screen, variant, device, loading, loadError,
    stages: bundle.stages, prospects: bundle.prospects, activity: bundle.activities, tasks: bundle.tasks,
    query, filter, selectedId, note, newOpen, fName, fSub, fValue,
    formError, toast, mTab, mStage,
  };

  const actions: AppActions = useMemo(
    () => ({
      setScreen,
      setVariant,
      setDevice,
      setQuery,
      setFilter,
      resetFilters: () => {
        setQuery('');
        setFilter('Tous');
      },
      openProspect: (id: string) => {
        setSelectedId(id);
        setNote('');
      },
      closeDrawer: () => setSelectedId(null),
      move,
      setStageOf,
      toggleTask,
      setNote,
      addNote,
      openNew,
      closeNew,
      setFName,
      setFSub,
      setFValue,
      submitNew,
      approve: () => setScreen('projet'),
      askRevision: () => setScreen('projet'),
      setMTab,
      setMStage,
      showToast,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fName, fSub, fValue, note, selectedId, bundle, organizationId],
  );

  return (
    <AppStateContext.Provider value={state}>
      <AppActionsContext.Provider value={actions}>{children}</AppActionsContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppActions(): AppActions {
  const ctx = useContext(AppActionsContext);
  if (!ctx) throw new Error('useAppActions must be used within AppProvider');
  return ctx;
}
