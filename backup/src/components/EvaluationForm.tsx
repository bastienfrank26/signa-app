import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitEvaluation, type EvaluationFormData } from '../lib/submitEvaluation';
import { Icons } from './Icons';
import { slideStep, fadeUp } from '../lib/motion';

const PACKAGES = ['Essentielle', 'Plus', 'Pro', 'Complète'] as const;

const NEEDS_OPTIONS = [
  'Refonte site web',
  'Modernisation logo',
  'Réseaux sociaux',
  'SEO local',
  'Contenu web',
];

const SECTORS = [
  'Construction & Rénovation',
  'Restaurants & Alimentation',
  'Services professionnels',
  'Commerce au détail',
  'Santé & Bien-être',
  'Beauté & Coiffure',
  'Transport & Logistique',
  'Autre',
];

const STEPS = ['Coordonnées', 'Entreprise', 'Besoins', 'Détails'];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  preselectedPackage?: string;
};

type State = 'idle' | 'loading' | 'success' | 'error';

const initialForm = (): EvaluationFormData => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: '',
  sector: '',
  city: '',
  currentWebsite: '',
  socialMedia: '',
  needs: [],
  problems: '',
  package: '',
  message: '',
  files: [],
});

export const EvaluationForm = ({ isOpen, onClose, preselectedPackage }: Props) => {
  const [form, setForm] = useState<EvaluationFormData>(() => ({
    ...initialForm(),
    package: preselectedPackage ?? '',
  }));
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EvaluationFormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const set = <K extends keyof EvaluationFormData>(key: K, value: EvaluationFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleNeed = (need: string) => {
    set(
      'needs',
      form.needs.includes(need) ? form.needs.filter((n) => n !== need) : [...form.needs, need],
    );
  };

  const validateStep = (s: number) => {
    const errors: Partial<Record<keyof EvaluationFormData, string>> = {};
    if (s === 0) {
      if (!form.firstName.trim()) errors.firstName = 'Requis';
      if (!form.lastName.trim()) errors.lastName = 'Requis';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email invalide';
      if (!form.phone.trim()) errors.phone = 'Requis';
    }
    if (s === 1) {
      if (!form.companyName.trim()) errors.companyName = 'Requis';
      if (!form.sector) errors.sector = 'Requis';
      if (!form.city.trim()) errors.city = 'Requis';
    }
    if (s === 2) {
      if (!form.package) errors.package = 'Choisissez un forfait';
    }
    return errors;
  };

  const goNext = () => {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');
    try {
      await submitEvaluation(form);
      setState('success');
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  };

  const handleClose = () => {
    setForm({ ...initialForm(), package: preselectedPackage ?? '' });
    setState('idle');
    setStep(0);
    setDirection(1);
    setErrorMsg('');
    setFieldErrors({});
    onClose();
  };

  const progress = (step + 1) / STEPS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-ink-800 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-ink-800 border-b border-white/10">
          <div className="flex items-center justify-between px-8 py-5">
            <span className="font-display font-bold text-white text-[20px]">
              Évaluation gratuite
            </span>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {state !== 'success' && (
            <>
              <div className="px-8 pb-3 flex items-center gap-2">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={[
                      'text-[11px] font-semibold transition-colors duration-300',
                      i === step ? 'text-brand' : i < step ? 'text-white/40' : 'text-white/25',
                    ].join(' ')}>
                      {label}
                    </span>
                    {i < STEPS.length - 1 && <span className="text-white/20 text-[11px]">·</span>}
                  </div>
                ))}
              </div>
              <div className="h-0.5 bg-white/10">
                <motion.div
                  className="h-full bg-brand"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </>
          )}
        </div>

        {/* Content */}
        {state === 'success' ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center px-8 py-16 text-center gap-5"
          >
            <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center">
              <Icons.Check className="w-8 h-8 text-brand" />
            </div>
            <h3 className="font-display font-bold text-white text-[24px]">Demande envoyée !</h3>
            <p className="text-white/70 text-[15px] max-w-md leading-relaxed">
              Votre demande a été envoyée avec succès. Signa analysera votre présence en ligne et vous contactera rapidement.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-3 rounded-md bg-brand hover:bg-brand-600 transition-colors text-white font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideStep}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="px-8 py-6 space-y-5"
                >
                  {step === 0 && (
                    <>
                      <h4 className="text-brand font-semibold tracking-[0.15em] text-[11px]">VOS COORDONNÉES</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Prénom" error={fieldErrors.firstName}>
                          <input type="text" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Jean" className={inputCls(!!fieldErrors.firstName)} />
                        </Field>
                        <Field label="Nom" error={fieldErrors.lastName}>
                          <input type="text" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Tremblay" className={inputCls(!!fieldErrors.lastName)} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Courriel" error={fieldErrors.email}>
                          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jean@entreprise.com" className={inputCls(!!fieldErrors.email)} />
                        </Field>
                        <Field label="Téléphone" error={fieldErrors.phone}>
                          <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="514 000-0000" className={inputCls(!!fieldErrors.phone)} />
                        </Field>
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <h4 className="text-brand font-semibold tracking-[0.15em] text-[11px]">VOTRE ENTREPRISE</h4>
                      <Field label="Nom de l'entreprise" error={fieldErrors.companyName}>
                        <input type="text" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Excavation Dubois" className={inputCls(!!fieldErrors.companyName)} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Secteur d'activité" error={fieldErrors.sector}>
                          <select value={form.sector} onChange={(e) => set('sector', e.target.value)} className={inputCls(!!fieldErrors.sector)}>
                            <option value="">Choisir...</option>
                            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </Field>
                        <Field label="Ville" error={fieldErrors.city}>
                          <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Montréal" className={inputCls(!!fieldErrors.city)} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Site web actuel (optionnel)">
                          <input type="url" value={form.currentWebsite} onChange={(e) => set('currentWebsite', e.target.value)} placeholder="https://monsite.com" className={inputCls(false)} />
                        </Field>
                        <Field label="Réseaux sociaux (optionnel)">
                          <input type="text" value={form.socialMedia} onChange={(e) => set('socialMedia', e.target.value)} placeholder="@monentreprise" className={inputCls(false)} />
                        </Field>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h4 className="text-brand font-semibold tracking-[0.15em] text-[11px]">VOS BESOINS</h4>
                      <div className="flex flex-wrap gap-2">
                        {NEEDS_OPTIONS.map((need) => {
                          const active = form.needs.includes(need);
                          return (
                            <button key={need} type="button" onClick={() => toggleNeed(need)} className={['px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer', active ? 'bg-brand text-white' : 'border border-white/20 text-white/70 hover:border-white/50'].join(' ')}>
                              {need}
                            </button>
                          );
                        })}
                      </div>
                      <Field label="Décrivez vos problèmes actuels">
                        <textarea value={form.problems} onChange={(e) => set('problems', e.target.value)} rows={3} placeholder="Mon site est vieux, pas mobile, je perds des clients..." className={inputCls(false) + ' resize-none'} />
                      </Field>
                      <div>
                        <h4 className="text-brand font-semibold tracking-[0.15em] text-[11px] mb-3">FORFAIT SOUHAITÉ</h4>
                        {fieldErrors.package && <p className="text-red-400 text-[12px] mb-2">{fieldErrors.package}</p>}
                        <div className="grid grid-cols-2 gap-3">
                          {PACKAGES.map((pkg) => {
                            const active = form.package === pkg;
                            return (
                              <button key={pkg} type="button" onClick={() => set('package', pkg)} className={['py-3 px-4 rounded-xl text-left transition-colors cursor-pointer', active ? 'border-2 border-brand bg-brand/10' : 'border border-white/15 hover:border-white/40'].join(' ')}>
                                <span className={['font-semibold text-[14px]', active ? 'text-brand' : 'text-white/80'].join(' ')}>{pkg}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="space-y-3">
                        <h4 className="text-brand font-semibold tracking-[0.15em] text-[11px]">MESSAGE (OPTIONNEL)</h4>
                        <textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={3} placeholder="Tout autre détail utile pour votre évaluation..." className={inputCls(false) + ' resize-none w-full'} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-brand font-semibold tracking-[0.15em] text-[11px]">FICHIERS (OPTIONNEL)</h4>
                        <p className="text-white/50 text-[13px]">Logo actuel, captures d'écran, références...</p>
                        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={(e) => set('files', Array.from(e.target.files ?? []))} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-3 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-white/60 hover:text-white/80 text-[14px] transition-colors cursor-pointer">
                          {form.files.length > 0 ? `${form.files.length} fichier(s) sélectionné(s)` : '+ Ajouter des fichiers'}
                        </button>
                      </div>
                      {state === 'error' && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[14px]">
                          {errorMsg}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="px-8 pb-6 pt-1 flex gap-3">
              {step > 0 && (
                <button type="button" onClick={goPrev} className="px-5 py-3 rounded-md border border-white/20 hover:border-white/50 text-white/70 hover:text-white font-semibold text-[14px] transition-colors cursor-pointer">
                  Retour
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={goNext} className="flex-1 py-3 rounded-md bg-brand hover:bg-brand-600 text-white font-semibold text-[14px] transition-colors cursor-pointer">
                  Continuer
                </button>
              ) : (
                <button type="submit" disabled={state === 'loading'} className="flex-1 py-4 rounded-md bg-brand hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white font-semibold text-[15px] cursor-pointer">
                  {state === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    'Envoyer ma demande'
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/70 text-[13px] font-medium">{label}</label>
      {children}
      {error && <span className="text-red-400 text-[12px]">{error}</span>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    'w-full bg-white/5 border rounded-md px-3.5 py-2.5 text-white text-[14px] placeholder-white/30',
    'focus:outline-none focus:ring-2 focus:ring-brand/50 transition-colors',
    hasError ? 'border-red-500/60' : 'border-white/15 focus:border-brand/50',
  ].join(' ');
}
