# Carte des fichiers importants

## Racine

- `AGENTS.md` — autorité principale, règles produit et techniques
- `CLAUDE.md` — pointe vers `AGENTS.md`
- `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` — squelette Vite/React/TS

## `src/`

- `main.tsx` — point d'entrée, routing (react-router-dom), AuthProvider
- `App.tsx` — `CrmPrototype` : shell CRM (toggle bureau/mobile, layout, drawer, modale, toast)
- `AppContext.tsx` — état global du prototype CRM (à démanteler en features dès Phase 3)
- `RequireOrganization.tsx` — affiche `CreateOrganizationPage` si l'utilisateur connecté n'a aucune membership
- `types.ts` — types du prototype (Prospect, Task, Stage, etc.)
- `ui.ts` — styles/tokens partagés (nav, pill, chip, tag, avatar)
- `styles/global.css` — reset, police Manrope, animations
- `vite-env.d.ts` — types Vite (`import.meta.env`)
- `data/seed.ts` — données de démonstration CRM (à déplacer en `infrastructure/fixtures/` par feature)
- `infrastructure/supabase/client.ts` — client Supabase unique (`VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`)

## `src/features/auth/` (Phase 0)

- `domain/auth.ts` — `AppSession`, `Membership`, `MembershipRole`, `AuthFailure`
- `application/AuthGateway.ts` — interface (port)
- `infrastructure/supabase/SupabaseAuthGateway.ts` — implémentation Supabase (signUp/signIn/signOut/reset/current_app_session)
- `presentation/` — `AuthProvider.tsx`, `AuthContext.ts`, `useAuth.ts`, `guards.tsx` (RequireAuth/RequireNoAuth), `AuthLayout.tsx`, `LoginPage.tsx`, `SignUpPage.tsx`, `ForgotPasswordPage.tsx`, `formStyles.ts`

## `src/features/organizations/` (Phase 0, minimal)

- `domain/organization.ts`, `application/OrganizationRepository.ts`
- `infrastructure/supabase/SupabaseOrganizationRepository.ts`
- `presentation/CreateOrganizationPage.tsx` — onboarding temporaire (self-service), à revoir en Phase 2 (création par Signa après paiement)

## `src/features/portal/` (Phase 1)

- `domain/project.ts` — `WebProject`, `ProjectStep`, `ProjectFile`, `RevisionRequest`, `Approval`, statuts et libellés français
- `application/ProjectRepository.ts` — interface (port)
- `infrastructure/supabase/SupabaseProjectRepository.ts` — `getBundle`, `submitRevisionRequest`, `approveVersion` (RPC), `uploadFile` (Storage + ligne `project_files`)
- `presentation/useProjectBundle.ts` — hook de chargement/rechargement
- `presentation/ProjectDashboardPage.tsx` — page réelle branchée sur l'écran "Suivi du projet" (`App.tsx`, remplace le stub)

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

## `supabase/`

- `migrations/20260912120000_core_organizations.sql` — organizations, memberships, invitations, RLS, `is_org_member`/`is_org_admin`
- `migrations/20260912121500_current_app_session.sql` — RPC `current_app_session()`
- `migrations/20260912123000_organizations_created_by.sql` — correctif RLS (colonne `created_by`)
- `migrations/20260912140000_portal_web_projects.sql` — web_projects, project_steps, project_files, revision_requests, approvals, RLS, auto-création du projet à la création d'une organisation
- `migrations/20260912141500_portal_approval_and_storage.sql` — RPC `approve_project_version`, bucket Storage `project-files` + RLS storage.objects

## Infrastructure (hors dépôt Git)

- pm2 : process `signa-app`, port 3100, `pm2 serve dist --spa`
- nginx : `/etc/nginx/sites-available/signa-app`
- SSL : `/etc/letsencrypt/live/app.signaweb.ca/`
- Supabase : projet `mnadbkbdbjmugvsadeen` (`ca-central-1`), identifiants dans `.input/supabase` (ignoré par Git) et `.env.local` (ignoré par Git)
