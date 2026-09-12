# Carte des fichiers importants

## Racine

- `AGENTS.md` — autorité principale, règles produit et techniques
- `CLAUDE.md` — pointe vers `AGENTS.md`
- `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` — squelette Vite/React/TS

## `src/`

- `main.tsx` — point d'entrée
- `App.tsx` — shell (toggle bureau/mobile, layout, drawer, modale, toast)
- `AppContext.tsx` — état global du prototype CRM (à démanteler en features dès Phase 0-3)
- `types.ts` — types du prototype (Prospect, Task, Stage, etc.)
- `ui.ts` — styles/tokens partagés (nav, pill, chip, tag, avatar)
- `styles/global.css` — reset, police Manrope, animations
- `data/seed.ts` — données de démonstration CRM (à déplacer en `infrastructure/fixtures/` par feature)

## `src/components/` (prototype visuel CRM — Phase 3 les branchera à Supabase, sans refonte)

- `Sidebar.tsx`, `Header.tsx` — layout bureau
- `HomeScreen.tsx` — accueil, variantes A (focus) et B (vue d'ensemble)
- `ProspectsScreen.tsx` — liste/filtre/recherche des prospects
- `PipelineScreen.tsx` — kanban par étape
- `ProspectCard.tsx` — carte prospect réutilisée (pipeline + mobile)
- `ProspectDrawer.tsx` — panneau détail (avancer étape, notes, historique)
- `NewProspectModal.tsx` — formulaire nouveau prospect
- `StubScreen.tsx` — écrans non maquettés (projet, fichiers, contacts, tâches)
- `MobileView.tsx` — vue mobile 320px (accueil + pipeline)
- `Toast.tsx` — notification non bloquante

## `memory/`

- `memory.md` — décisions durables et contexte
- `tasks.md` — tâches atomiques et état réel
- `plans.md` — plans actifs et prochaines étapes
- `file-index.md` — ce fichier

## Infrastructure (hors dépôt Git)

- pm2 : process `signa-app`, port 3100, `pm2 serve dist --spa`
- nginx : `/etc/nginx/sites-available/signa-app`
- SSL : `/etc/letsencrypt/live/app.signaweb.ca/`
