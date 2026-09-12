# Carte des fichiers importants

## Racine

- `AGENTS.md` — autorité principale, règles produit et techniques
- `CLAUDE.md` — pointe vers `AGENTS.md`
- `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` — squelette Vite/React/TS

## `src/`

- `main.tsx` — point d'entrée, routing (react-router-dom), AuthProvider
- `App.tsx` — `CrmPrototype` : shell CRM (layout responsive réel, drawer, modale, toast)
- `AppContext.tsx` — état global du prototype CRM (à démanteler en features dès Phase 3)
- `RequireOrganization.tsx` — affiche `CreateOrganizationPage` si l'utilisateur connecté n'a aucune membership
- `types.ts` — types du prototype (Prospect, Task, Stage, etc.)
- `ui.ts` — styles/tokens partagés (nav, pill, chip, tag, avatar)
- `navigation.ts` — source unique des sections/écrans de navigation (Sidebar, MobileNav, MobileMoreSheet)
- `styles/global.css` — reset, police Manrope, animations, seuil responsive 768 px (`.sg-desktop-only`/`.sg-mobile-only`)
- `components/ui/Button.tsx` — bouton du design system (primaire/secondaire/discret/dangereux)
- `components/MobileNav.tsx` — barre d'onglets mobile fixe (réelle, pilotée par media query CSS)
- `components/MobileMoreSheet.tsx` — feuille mobile « Plus » (nav secondaire, compte, déconnexion)
- `vite-env.d.ts` — types Vite (`import.meta.env`)
- `data/seed.ts` — données de démonstration CRM (à déplacer en `infrastructure/fixtures/` par feature)
- `infrastructure/supabase/client.ts` — client Supabase unique (`VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`)

## `src/features/crm/` (Phase 3, module Contacts ajouté 2026-09-12)

- `domain/crm.ts` — `Prospect`, `Stage`, `ActivityItem`, `Task`, `Contact`, `ContactDetail`, `NewContactInput`
- `application/CrmRepository.ts` — interface (port), inclut `listContacts`/`createContact`/`getContactDetail`/`addContactNote`
- `infrastructure/supabase/SupabaseCrmRepository.ts` — implémentation Supabase
- `presentation/useContacts.ts` — hook de chargement/rechargement des contacts (patron `useProjectBundle.ts`)
- `src/components/ContactsScreen.tsx`, `ContactDrawer.tsx`, `NewContactModal.tsx` — écran Contacts (liste, fiche, création)

## `src/features/auth/` (Phase 0)

- `domain/auth.ts` — `AppSession`, `Membership`, `MembershipRole`, `AuthFailure`
- `application/AuthGateway.ts` — interface (port)
- `infrastructure/supabase/SupabaseAuthGateway.ts` — implémentation Supabase (signUp/signIn/signOut/reset/current_app_session)
- `presentation/` — `AuthProvider.tsx`, `AuthContext.ts`, `useAuth.ts`, `guards.tsx` (RequireAuth/RequireNoAuth), `AuthLayout.tsx`, `LoginPage.tsx`, `SignUpPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx` (Phase 6 : manquait complètement, route `/reinitialiser-mot-de-passe`), `formStyles.ts`, `SecurityPage.tsx` (Phase 5 : enrôlement MFA TOTP, `/parametres/securite`)

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

## `src/features/admin/` (Phase 2)

- `domain/admin.ts` — `StaffRole`, `OrganizationSummary`, `OrganizationDetail`, `AuditEvent`
- `application/AdminRepository.ts` — interface (port)
- `infrastructure/supabase/SupabaseAdminRepository.ts` — liste/détail organisations, RPC admin (statuts, étapes, memberships), audit
- `presentation/useStaffRole.ts` — hook + instance partagée du repository (`adminRepository`)
- `presentation/RequireStaff.tsx` — garde de route (affiche "Accès refusé" si non-personnel)
- `presentation/AdminLayout.tsx`, `OrganizationsListPage.tsx`, `OrganizationDetailPage.tsx`, `AuditLogPage.tsx`, `ReasonDialog.tsx` (motif obligatoire réutilisable), `SitesSection.tsx` (Phase 4 : création/rotation/statut de site, secret affiché une fois), `BillingSection.tsx` (Phase 5 : statut d'abonnement, lien de paiement), `PilotMetricsPage.tsx` (Phase 6 : indicateurs du pilote)

## `src/features/crm/` (Phase 3)

- `domain/crm.ts` — `Stage`, `Prospect` (= opportunité + contact joints), `ActivityItem`, `Task`, `CrmBundle`
- `domain/stageColors.ts` — couleur par `stage_key` (front seulement, pas en base)
- `domain/format.ts` — `formatNextFollowUp`, `formatRelativeTime`
- `application/CrmRepository.ts` — interface (port)
- `infrastructure/supabase/SupabaseCrmRepository.ts` — `getBundle`, `createProspect` (contact + opportunité), `moveStage`, `addActivityNote`, `toggleTask`
- Pas de dossier `presentation/` propre : le CRM réutilise directement les composants du prototype (`src/components/*`), désormais alimentés par `AppContext.tsx` au lieu de `data/seed.ts` (supprimé)

## `src/components/` (prototype visuel CRM — branché à Supabase depuis la Phase 3 via `AppContext.tsx`, sans refonte visuelle)

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
- `migrations/20260912150000_admin_internal_staff.sql` — `internal_staff`, `audit_events`, `organizations.status`, policies staff (lecture cross-org) et garde de suspension sur les écritures client
- `migrations/20260912151500_admin_actions.sql` — RPC admin (`admin_set_organization_status`, `admin_set_project_status`, `admin_set_step_status`, `admin_update_membership`), motif obligatoire + audit
- `migrations/20260912152000_admin_membership_emails.sql` — RPC `admin_organization_memberships` (courriels des membres pour le personnel Signa)
- `migrations/20260912160000_crm_core.sql` — pipelines, pipeline_stages, contacts, opportunities, activities, tasks, RLS (`is_org_writer` bloque le rôle readonly), pipeline par défaut auto-créé, activité automatique gagné/perdu
- `migrations/20260912170000_site_integrations.sql` — sites, api_keys, form_submissions (staff seulement), RPC admin (create/rotate/status/list), `capture_site_submission_v1`
- `migrations/20260912171500_site_integrations_write_policies.sql` — correctif RLS (policies INSERT/UPDATE manquantes sur sites/api_keys)
- `migrations/20260912172000_site_test_integration.sql` — `capture_site_submission_v1` en security definer, `admin_test_site_integration` (bouton de test admin, sans CORS)
- `migrations/20260912172500_fix_capture_function_privileges.sql` — **correctif de sécurité** : révoque EXECUTE de `anon`/`authenticated` sur `capture_site_submission_v1` (voir note de sécurité dans tasks.md)
- `migrations/20260912180000_billing_stripe.sql` — plans, plan_prices, subscriptions, billing_events (staff seulement), `is_org_billing_active()`, plans/prix Stripe test seedés
- `migrations/20260912190000_pilot_metrics.sql` — RPC `admin_pilot_metrics` (Phase 6)

## `supabase/functions/`

- `site-submissions/` (Phase 4) — Edge Function publique, `POST /site-submissions/{siteId}`, auth par clé de site hachée (`x-signa-site-key`), CORS par origine déclarée, déployée avec `--no-verify-jwt`
- `stripe-webhook/` (Phase 5) — signature Stripe vérifiée sur le corps brut, idempotent (`billing_events.stripe_event_id`), `--no-verify-jwt`
- `create-checkout-session/` (Phase 5) — staff seulement (vérifie `current_staff_role` via le JWT de l'appelant), crée une session Stripe Checkout
- `revoke-user-sessions/` (Phase 5) — staff seulement, déconnecte un utilisateur de tous ses appareils (`auth.admin.signOut`), audité

## `docs/` (Phase 5)

- `00` à `14` — copie annotée de la documentation produit du projet Design, avec l'état réel d'implémentation à jour au 2026-09-12
- `14-DECISIONS.md` — registre des décisions mis à jour (DEC-009/012 remplacées, DEC-015 à DEC-019 ajoutées)
- `loi25/` — gabarits de travail (politique de confidentialité, registre des traitements, procédure incident) : **brouillons non validés légalement**, voir `docs/loi25/README.md`

## Infrastructure (hors dépôt Git)

- pm2 : process `signa-app`, port 3100, `pm2 serve dist --spa`
- nginx : `/etc/nginx/sites-available/signa-app`
- SSL : `/etc/letsencrypt/live/app.signaweb.ca/`
- Supabase : projet `mnadbkbdbjmugvsadeen` (`ca-central-1`), identifiants dans `.input/supabase` (ignoré par Git) et `.env.local` (ignoré par Git)
- Supabase Auth : `site_url` = `https://app.signaweb.ca`, `uri_allow_list` = `https://app.signaweb.ca/**` (corrigé le 2026-09-12, pointait vers `http://localhost:3000` par défaut — cassait tous les liens de courriel : confirmation, réinitialisation)
