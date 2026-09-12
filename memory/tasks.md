# Tâches atomiques

## Terminées

- [x] Maquette visuelle CRM (React + TS) implantée depuis le design Claude Design — 2026-09-12
- [x] Déploiement pm2 (`signa-app`, port 3100) + nginx + SSL sur `app.signaweb.ca` — 2026-09-12
- [x] Correction DNS `app.signaweb.ca` (pointait vers le mauvais serveur) — 2026-09-12
- [x] Plan de développement complet rédigé et approuvé — 2026-09-12
- [x] `AGENTS.md` (Francis), `CLAUDE.md` (référence vers AGENTS.md) — 2026-09-12
- [x] Système de mémoire (`memory/memory.md`, `tasks.md`, `plans.md`, `file-index.md`) — 2026-09-12
- [x] Repo GitHub `groupe-reca/signa-app` créé et lié (temporaire, en attendant transfert vers `bastienfrank26`) — 2026-09-12

## Terminées (Phase 0) — 2026-09-12

- [x] Projet Supabase créé et lié via CLI (`mnadbkbdbjmugvsadeen`, région `ca-central-1`)
- [x] Migrations `organizations`, `memberships`, `invitations` + fonctions `is_org_member`/`is_org_admin`/`current_app_session` (security definer)
- [x] `features/auth` (SupabaseAuthGateway, AuthProvider, LoginPage, SignUpPage, ForgotPasswordPage, guards)
- [x] `features/organizations` (CreateOrganizationPage, onboarding minimal pour Phase 0)
- [x] react-router-dom ajouté : `/connexion`, `/inscription`, `/mot-de-passe-oublie` publiques ; `/*` protégé (RequireAuth → RequireOrganization → prototype CRM)
- [x] Isolation RLS vérifiée avec 2 comptes de test réels (via API admin Supabase, nettoyés après test) : un compte ne voit ni les organisations ni les memberships d'un autre, ne peut pas s'auto-insérer dans une organisation étrangère
- [x] Bug RLS trouvé et corrigé : `insert().select()` sur `organizations` échouait (policy SELECT dépendait de la membership insérée par trigger, non visible au moment du RETURNING) — fix : colonne `created_by` + policy SELECT alternative
- [x] Redéployé sur pm2/nginx (build + `pm2 restart signa-app`)

- [x] DNS `app.signaweb.ca` corrigé et stable — 2026-09-12
- [x] Parcours complet testé en vrai navigateur (Playwright/Chromium contre `app.signaweb.ca` en production) : redirection non-authentifié, mauvais mot de passe (message d'erreur affiché), bon login, création d'organisation, bascule vers le CRM, navigation Prospects/Pipeline, session qui persiste après reload — tout conforme — 2026-09-12

## À faire (avant Phase 1)

- [ ] Décider si l'inscription libre (`/inscription`) reste ouverte au public ou si elle doit être retirée avant le pilote (le MVP prévoit que Signa crée les comptes après paiement, pas un self-signup)
- [ ] Configurer un vrai fournisseur SMTP (Resend, comme `reca-app-v3`) dans Supabase Auth — le SMTP par défaut limite l'envoi de courriels de confirmation/réinitialisation à quelques par heure
