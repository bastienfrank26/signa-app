# Plans actifs

Plan de développement complet : voir `/root/.claude/plans/mellow-toasting-dahl.md` (approuvé le 2026-09-12). Résumé des phases ci-dessous ; se référer au fichier complet pour le détail par phase.

## Phases (ordre confirmé)

- [x] Phase 0 — Fondation technique : Supabase, `organizations`/`memberships`/`invitations`, `features/auth`, react-router-dom, autorisation serveur (terminée 2026-09-12, détail dans `tasks.md`)
- [x] Phase 1 — Portail client : projets web, étapes, fichiers, corrections, approbations (terminée 2026-09-12, détail dans `tasks.md`; notifications essentielles reportées, voir tasks.md)
- [x] Phase 2 — Administration Signa : organisations, accès, projets web, audit (terminée 2026-09-12 ; modules/sites/abonnements reportés, voir tasks.md — pas de table backing avant Phase 3/4/5)
- [ ] Phase 3 — CRM réel : brancher le prototype visuel existant (`HomeScreen`, `ProspectsScreen`, `PipelineScreen`) à Supabase
- [ ] Phase 4 — Intégrations de sites : `siteId`, clés, soumissions idempotentes, Edge Function `site-submissions`
- [ ] Phase 5 — Production : Stripe, MFA, Loi 25, sauvegardes, observabilité
- [ ] Phase 6 — Pilote : 3 à 5 entreprises réelles
- [ ] Phase 7 — Expansion : module Rendez-vous ou Appels de service (DEC-014)

## Prochaine étape immédiate

Phase 3 — CRM réel (brancher le prototype visuel existant à Supabase). Voir `tasks.md` pour ce que la Phase 2 laisse ouvert (création d'organisation par Signa avec invitation, modules/sites/abonnements).
