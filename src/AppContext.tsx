import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { SEED_ACTIVITY, SEED_PROSPECTS, SEED_TASKS, STAGES } from './data/seed';
import type {
  ActivityItem,
  Device,
  HistoryEntry,
  MobileTab,
  Prospect,
  Screen,
  Stage,
  Task,
  Variant,
} from './types';

export function money(v: number): string {
  return v.toLocaleString('fr-CA').replace(/,/g, ' ') + ' $';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function stageColor(stage: Stage): string {
  return STAGES.find((s) => s.key === stage)?.color ?? '#8899AA';
}

interface AppState {
  screen: Screen;
  variant: Variant;
  device: Device;
  prospects: Prospect[];
  tasks: Task[];
  activity: ActivityItem[];
  history: Record<number, HistoryEntry[]>;
  query: string;
  filter: Stage | 'Tous';
  selectedId: number | null;
  note: string;
  newOpen: boolean;
  fName: string;
  fSub: string;
  fValue: string;
  formError: boolean;
  toast: string | null;
  mTab: MobileTab;
  mStage: Stage;
}

interface AppActions {
  setScreen: (s: Screen) => void;
  setVariant: (v: Variant) => void;
  setDevice: (d: Device) => void;
  setQuery: (q: string) => void;
  setFilter: (f: Stage | 'Tous') => void;
  resetFilters: () => void;
  openProspect: (id: number) => void;
  closeDrawer: () => void;
  move: (id: number, dir: 1 | -1) => void;
  setStageOf: (id: number, stage: Stage) => void;
  toggleTask: (id: number) => void;
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
  exportCsv: () => void;
  setMTab: (t: MobileTab) => void;
  setMStage: (s: Stage) => void;
  showToast: (msg: string) => void;
}

const AppStateContext = createContext<AppState | null>(null);
const AppActionsContext = createContext<AppActions | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('accueil');
  const [variant, setVariant] = useState<Variant>('A');
  const [device, setDevice] = useState<Device>('desktop');
  const [prospects, setProspects] = useState<Prospect[]>(SEED_PROSPECTS);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [activity] = useState<ActivityItem[]>(SEED_ACTIVITY);
  const [history, setHistory] = useState<Record<number, HistoryEntry[]>>({});
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Stage | 'Tous'>('Tous');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [fName, setFName] = useState('');
  const [fSub, setFSub] = useState('');
  const [fValue, setFValue] = useState('');
  const [formError, setFormError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mTab, setMTab] = useState<MobileTab>('home');
  const [mStage, setMStage] = useState<Stage>('Nouveau');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const pushHistory = (id: number, text: string) => {
    setHistory((h) => ({
      ...h,
      [id]: [{ text, time: 'à l’instant' }, ...(h[id] ?? [])],
    }));
  };

  const move = (id: number, dir: 1 | -1) => {
    setProspects((items) => {
      const keys = STAGES.map((s) => s.key);
      return items.map((it) => {
        if (it.id !== id) return it;
        const i = keys.indexOf(it.stage);
        const n = Math.max(0, Math.min(keys.length - 1, i + dir));
        const nextStage = keys[n];
        pushHistory(id, 'Étape changée pour « ' + nextStage + ' »');
        showToast(it.name + ' → ' + nextStage);
        return { ...it, stage: nextStage };
      });
    });
  };

  const setStageOf = (id: number, stage: Stage) => {
    setProspects((items) => {
      const item = items.find((x) => x.id === id);
      if (item) {
        pushHistory(id, 'Étape changée pour « ' + stage + ' »');
        showToast(item.name + ' → ' + stage);
      }
      return items.map((it) => (it.id === id ? { ...it, stage } : it));
    });
  };

  const toggleTask = (id: number) => {
    setTasks((ts) => {
      const t = ts.find((x) => x.id === id);
      if (t && !t.done) showToast('Tâche terminée : ' + t.label);
      return ts.map((x) => (x.id === id ? { ...x, done: !x.done } : x));
    });
  };

  const addNote = () => {
    if (selectedId == null || !note.trim()) {
      showToast('Écrivez une note avant d’enregistrer');
      return;
    }
    pushHistory(selectedId, note.trim());
    setNote('');
    showToast('Activité enregistrée');
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
    if (!fName.trim()) {
      setFormError(true);
      return;
    }
    setProspects((items) => {
      const id = Math.max(...items.map((x) => x.id)) + 1;
      const item: Prospect = {
        id,
        name: fName.trim(),
        company: fName.trim(),
        sub: fSub.trim() || 'Nouvelle demande',
        value: parseInt(fValue.replace(/\D/g, ''), 10) || 0,
        stage: 'Nouveau',
        source: 'Création manuelle',
        email: '—',
        phone: '—',
        next: 'À planifier',
      };
      return [item, ...items];
    });
    closeNew();
    showToast('Prospect ajouté à « Nouveau »');
  };

  const state: AppState = {
    screen, variant, device, prospects, tasks, activity, history,
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
      openProspect: (id: number) => {
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
      approve: () => showToast('Version approuvée · mise en ligne planifiée'),
      askRevision: () => showToast('Demande de correction envoyée à Signa'),
      exportCsv: () => showToast('Export CSV généré (démonstration)'),
      setMTab,
      setMStage,
      showToast,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fName, fSub, fValue, note, selectedId],
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
