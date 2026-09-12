# Registre des décisions

Les décisions sont datées, leur statut est explicite et un remplacement conserve l'historique.

| ID | Date | Statut | Décision | Motif |
| --- | --- | --- | --- | --- |
| DEC-001 | 2026-09-12 | Acceptée | `signa-app` reste distinct de `signa-landing` | Séparer acquisition et espace authentifié |
| DEC-002 | 2026-09-12 | Acceptée | Plateforme multi-organisation | Servir plusieurs entreprises avec une base commune |
| DEC-003 | 2026-09-12 | Acceptée (partielle) | Le portail est le premier accès après paiement | Centraliser onboarding et production — en pratique, l'inscription précède le paiement (voir DEC-015) |
| DEC-004 | 2026-09-12 | Acceptée | Noyau commun et modules activables | Couvrir plusieurs métiers sans duplication |
| DEC-005 | 2026-09-12 | Acceptée | Un module principal dans le forfait Entreprise | Rendre l'offre simple et concrète |
| DEC-006 | 2026-09-12 | Acceptée | CRM, puis Rendez-vous et Appels de service | Progresser entre ventes, planification et terrain |
| DEC-007 | 2026-09-12 | Acceptée | Sites fabriqués séparément | Préserver la création manuelle |
| DEC-008 | 2026-09-12 | Acceptée | Connexion par `siteId` et accès révocable | Éliminer les changements répétitifs de l'app |
| DEC-009 | 2026-09-12 | **Remplacée par DEC-016** | React, Next.js, TypeScript, Cloudflare et Drizzle au pilote | Capitaliser sur la base actuelle |
| DEC-010 | 2026-09-12 | Acceptée | `organizationId` imposé côté serveur | Prévenir les fuites entre clients — implémenté via Row Level Security Supabase |
| DEC-011 | 2026-09-12 | Acceptée | Français québécois comme langue initiale | Servir le marché prioritaire |
| DEC-012 | 2026-09-12 | **Remplacée par DEC-017** | Fournisseur d'authentification public | L'accès privé actuel ne couvre pas le SaaS |
| DEC-013 | 2026-09-12 | À confirmer | Grâce après paiement échoué | Aligner expérience, risque et opérations — actuellement `past_due` traité comme actif indéfiniment, sans limite |
| DEC-014 | 2026-09-12 | À confirmer | Premier module après CRM | Choisir selon les pilotes prêts à payer |
| DEC-015 | 2026-09-12 | Acceptée (temporaire) | Inscription libre (self-service) au lieu de création par Signa après paiement | Permettre de construire et tester le noyau multi-organisation sans attendre le flux de paiement complet (Phase 0). À revoir avant le pilote commercial : DEC-003 prévoit que Signa crée le compte après paiement, pas l'inverse |
| DEC-016 | 2026-09-12 | Acceptée | Vite + React (SPA) + Supabase (Postgres/Auth/Storage/Edge Functions), déployé sur VPS existant (pm2 + nginx), pas Cloudflare | Aligner sur les conventions déjà utilisées par l'équipe (`reca-app-v3`) plutôt qu'introduire une nouvelle stack ; remplace DEC-009 |
| DEC-017 | 2026-09-12 | Acceptée | Supabase Auth (courriel + mot de passe, MFA TOTP en self-service) | Fournisseur déjà en place avec le reste de la stack (DEC-016) ; remplace DEC-012 |
| DEC-018 | 2026-09-12 | À confirmer | Passer le projet Supabase à un palier payant pour activer les sauvegardes/PITR | Le palier actuel n'a aucune sauvegarde automatique — décision commerciale (coût récurrent), pas technique |
| DEC-019 | 2026-09-12 | À confirmer | Produits/prix Stripe créés en mode test (`prod_VFOaESoM6OOPUz`) | À recréer en mode production avant tout paiement réel — décision commerciale sur les montants finaux (129$/149$ restent à confirmer) |

## Nouvelle décision

Ajouter une ligne séquentielle avec date, statut, décision et motif. En cas de remplacement, conserver l'ancienne avec « Remplacée par DEC-XXX ».
