# Plans actifs

Plan de développement complet : voir `/root/.claude/plans/mellow-toasting-dahl.md` (approuvé le 2026-09-12). Résumé des phases ci-dessous ; se référer au fichier complet pour le détail par phase.

## Phases (ordre confirmé)

- [x] Phase 0 — Fondation technique : Supabase, `organizations`/`memberships`/`invitations`, `features/auth`, react-router-dom, autorisation serveur (terminée 2026-09-12, détail dans `tasks.md`)
- [x] Phase 1 — Portail client : projets web, étapes, fichiers, corrections, approbations (terminée 2026-09-12, détail dans `tasks.md`; notifications essentielles reportées, voir tasks.md)
- [x] Phase 2 — Administration Signa : organisations, accès, projets web, audit (terminée 2026-09-12 ; modules/sites/abonnements reportés, voir tasks.md — pas de table backing avant Phase 3/4/5)
- [x] Phase 3 — CRM réel : contacts/pipelines/opportunités/activités/tâches branchés à Supabase, prototype visuel réutilisé sans refonte (terminée 2026-09-12, détail dans `tasks.md`)
- [x] Phase 4 — Intégrations de sites : `siteId`, clés, soumissions idempotentes, Edge Function `site-submissions` (terminée 2026-09-12, détail dans `tasks.md` — inclut une faille de sécurité trouvée et corrigée en cours de route)
- [~] Phase 5 — Production : **en cours**. Fait : Stripe (webhooks + lien de paiement), MFA TOTP, révocation de session, gabarits Loi 25. Reste : sauvegardes (décision commerciale requise, palier Supabase actuel n'en a aucune), courriels transactionnels, observabilité, séparation dev/prod. Détail dans `tasks.md`
- [~] Phase 6 — Pilote : outillage livré (indicateurs), bugs réels corrigés (export CSV, lien courriel cassé) ; recruter les 3 à 5 vraies entreprises est une activité commerciale, pas de l'ingénierie — revient à Francis
- [ ] Phase 7 — Expansion : module Rendez-vous ou Appels de service (DEC-014)

## Prochaine étape immédiate

En attente de Francis : décisions Phase 5 en suspens (sauvegardes, Stripe production, Loi 25) et démarrage réel du pilote (trouver les 3-5 entreprises). Voir `tasks.md`.
