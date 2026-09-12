# Modèle de données

## Principe multi-organisation

Une organisation représente une entreprise cliente. Toute donnée client porte `organizationId`, directement ou par une relation obligatoire. Le serveur le détermine depuis l'accès autorisé (Row Level Security Supabase).

## Entités cibles

| Groupe | Entités principales | État (2026-09-12) |
| --- | --- | --- |
| Accès | `users`, `organizations`, `memberships`, `invitations` | Construit (Phase 0) ; `invitations` existe mais pas encore utilisée par un flux |
| Portail | `web_projects`, `project_steps`, `project_files`, `revision_requests`, `approvals` | Construit (Phase 1) |
| Noyau | `contacts`, `activities`, `tasks` | Construit (Phase 3) — pas de `companies`/`notifications`/`files` génériques séparées |
| Modules | `module_catalog`, `module_subscriptions`, `module_settings` | Non construit |
| CRM | `pipelines`, `pipeline_stages`, `opportunities` | Construit (Phase 3) |
| Rendez-vous | `services`, `resources`, `availabilities`, `appointments` | Non construit |
| Service | `service_calls`, `work_orders`, `dispatch_assignments` | Non construit |
| Intégrations | `sites`, `api_keys`, `form_submissions` | Construit (Phase 4) ; `webhook_deliveries` reporté (pas de webhooks sortants) |
| Commerce | `plans`, `plan_prices`, `subscriptions`, `billing_events` | Construit (Phase 5) |
| Gouvernance | `audit_events` | Construit (Phase 2) ; `privacy_requests`/`data_exports` non construits |

## Relations fondamentales

- Un utilisateur peut appartenir à plusieurs organisations.
- Une organisation possède plusieurs membres, sites, projets et droits.
- Un contact peut être associé à une entreprise et utilisé par plusieurs modules de la même organisation.
- Une soumission référence, si créé, l'objet métier résultant.
- Un abonnement accorde des droits; sa fin ne supprime pas les données.

## Conventions

- Identifiants opaques générés par le serveur (`uuid`, `gen_random_uuid()`).
- Dates stockées en UTC (`timestamptz`).
- Montants en cents avec devise explicite.
- États validés par une liste fermée (`check` constraints).
- Index commençant par `organizationId` pour les requêtes fréquentes.
- Unicité composée lorsqu'elle est propre à une organisation.
- JSON réservé aux configurations variables et validées.

## Intégrité et historique

Les activités gardent leur auteur et leur heure. Les approbations sont immuables. Les références critiques utilisent des clés étrangères.

## Migrations

Chaque changement produit une nouvelle migration Supabase SQL (`supabase/migrations/`). Une migration appliquée n'est jamais modifiée. Les changements risqués suivent : ajouter, remplir, basculer, puis retirer plus tard.

## Conservation

Les durées par catégorie ne sont pas encore définies (voir `docs/09-SECURITE-ET-LOI-25.md` et le registre des traitements dans `docs/loi25/`).
