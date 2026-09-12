# Tâches atomiques

## Terminées

- [x] Maquette visuelle CRM (React + TS) implantée depuis le design Claude Design — 2026-09-12
- [x] Déploiement pm2 (`signa-app`, port 3100) + nginx + SSL sur `app.signaweb.ca` — 2026-09-12
- [x] Correction DNS `app.signaweb.ca` (pointait vers le mauvais serveur) — 2026-09-12
- [x] Plan de développement complet rédigé et approuvé — 2026-09-12
- [x] `AGENTS.md` (Francis), `CLAUDE.md` (référence vers AGENTS.md) — 2026-09-12
- [x] Système de mémoire (`memory/memory.md`, `tasks.md`, `plans.md`, `file-index.md`) — 2026-09-12
- [x] Repo GitHub `groupe-reca/signa-app` créé et lié (temporaire, en attendant transfert vers `bastienfrank26`) — 2026-09-12

## À faire (Phase 0)

- [ ] Créer le projet Supabase, lier via CLI
- [ ] Migrations `organizations`, `memberships`, `invitations`
- [ ] `features/auth` (SupabaseAuthGateway, AuthProvider, LoginPage, guards)
- [ ] Ajouter react-router-dom, retirer la navigation par état de `AppContext`
- [ ] Vérifier l'isolation RLS avec 2 comptes de test
