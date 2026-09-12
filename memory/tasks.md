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

## Terminées (Phase 1) — 2026-09-12

- [x] Migrations `web_projects`, `project_steps`, `project_files`, `revision_requests`, `approvals` + RLS (`is_project_member`/`is_project_admin`)
- [x] Trigger : la création d'une organisation crée automatiquement son `web_project` (statut `awaiting_information`) + les 6 étapes standard — comble temporairement l'absence de Phase 2 (Signa qui crée le projet manuellement)
- [x] RPC `approve_project_version` : refuse si le projet n'est pas en `private_review`, insère l'approbation (immuable) et passe le projet à `approved`, le tout protégé par RLS (pas de security definer nécessaire)
- [x] Bucket Storage `project-files` (privé, chemin `{organization_id}/{web_project_id}/...`), RLS storage.objects par organisation
- [x] `features/portal` : `ProjectDashboardPage` (progression, version privée + approbation, fichiers, corrections, historique), branchée sur l'écran "Suivi du projet" du prototype existant
- [x] Vérifié par script (isolation RLS tables + storage entre 2 organisations) et en vrai navigateur (Playwright, production) : demande de correction, téléversement de fichier, passage en révision privée (simulé côté Signa via service role), approbation réelle confirmée en base

## À faire (avant Phase 2)

- [ ] Décider si l'inscription libre (`/inscription`) reste ouverte au public ou si elle doit être retirée avant le pilote (le MVP prévoit que Signa crée les comptes après paiement, pas un self-signup)
- [ ] Configurer un vrai fournisseur SMTP (Resend, comme `reca-app-v3`) dans Supabase Auth — le SMTP par défaut limite l'envoi de courriels de confirmation/réinitialisation à quelques par heure
- [ ] `project_steps` reste toujours à `pending` : rien ne les fait passer à `in_progress`/`done` pour l'instant — ce sera une action de l'administration Signa (Phase 2), pas du client
- [ ] Les transitions de `web_projects.status` (`content_review` → `in_production` → `private_review` → …) ne sont exposées nulle part côté client par design (seul `approve_project_version` peut faire avancer un statut, et seulement `private_review` → `approved`) — Phase 2 doit fournir la console qui les pilote (aujourd'hui seul le service role peut le faire, utilisé pour les tests)
- [ ] Notifications essentielles (accès créé, version prête, réponse correction, approbation demandée, site en ligne) pas encore implémentées — prévues avec un Edge Function d'envoi courriel (patron `resend-webhook` de `reca-app-v3`)
