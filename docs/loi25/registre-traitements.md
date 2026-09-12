# Registre des traitements — Signa

> **BROUILLON DE TRAVAIL — INTERNE — À COMPLÉTER AVEC UN AVOCAT.** Voir `docs/loi25/README.md`.

_Dernière révision : 2026-09-12, à partir de l'état réel du schéma de base de données._

Pour chaque catégorie : quelles données, pourquoi, qui y accède, où elles sont hébergées, combien de temps elles sont conservées.

| Catégorie | Table(s) | Finalité | Accès | Fournisseur / lieu | Conservation |
| --- | --- | --- | --- | --- | --- |
| Identité utilisateur (courriel, mot de passe haché) | `auth.users` (Supabase) | Authentification | L'utilisateur lui-même ; personnel Signa (`operations`/`super_admin`) pour le soutien | Supabase, `ca-central-1` | [À DÉCIDER] |
| Appartenance à une organisation | `memberships` | Contrôler l'accès aux données de l'organisation | Membres de la même organisation ; personnel Signa | Supabase, `ca-central-1` | [À DÉCIDER] |
| Organisation (nom d'entreprise) | `organizations` | Identifier le compte client | Membres de l'organisation ; personnel Signa | Supabase, `ca-central-1` | [À DÉCIDER] |
| Projet web (statut, échéances) | `web_projects`, `project_steps` | Suivre la livraison du site | Membres de l'organisation ; personnel Signa | Supabase, `ca-central-1` | [À DÉCIDER] |
| Fichiers de projet (logo, photos, textes) | `project_files` + Supabase Storage (`project-files`) | Produire le site web du client | Membres de l'organisation ; personnel Signa | Supabase Storage, `ca-central-1` | [À DÉCIDER] |
| Demandes de correction | `revision_requests` | Communiquer sur les corrections du site | Membres de l'organisation ; personnel Signa | Supabase, `ca-central-1` | [À DÉCIDER] |
| Approbations (version, consentement, horodatage) | `approvals` | Preuve d'approbation contractuelle | Membres de l'organisation ; personnel Signa | Supabase, `ca-central-1` | [À DÉCIDER — probablement une conservation longue, valeur probante] |
| Contacts et prospects (nom, courriel, téléphone) | `contacts` | Exploiter le CRM du client | Membres de l'organisation (sauf rôle lecture seule pour l'écriture) ; personnel Signa | Supabase, `ca-central-1` | [À DÉCIDER] |
| Opportunités d'affaires | `opportunities` | Suivre le pipeline de vente du client | Idem contacts | Supabase, `ca-central-1` | [À DÉCIDER] |
| Activités et notes CRM | `activities` | Historique des interactions | Idem contacts | Supabase, `ca-central-1` | [À DÉCIDER] |
| Tâches | `tasks` | Organisation du travail de l'équipe cliente | Membres de l'organisation | Supabase, `ca-central-1` | [À DÉCIDER] |
| Soumissions de formulaire (provenant des sites clients) | `form_submissions` | Traçabilité des prospects entrants, anti-fraude | Personnel Signa seulement | Supabase, `ca-central-1` | [À DÉCIDER] |
| Clés d'intégration de site | `api_keys` (hachage seulement) | Authentifier les appels des sites clients | Personnel Signa seulement | Supabase, `ca-central-1` | Jusqu'à révocation ; le secret en clair n'est jamais stocké |
| Abonnement et facturation | `subscriptions`, `billing_events`, `plans`, `plan_prices` | Facturer le service | Personnel Signa seulement | Supabase (miroir), Stripe (source) | [À DÉCIDER] ; Stripe conserve selon sa propre politique |
| Journal d'audit (actions administratives) | `audit_events` | Traçabilité, sécurité, conformité | Personnel Signa seulement | Supabase, `ca-central-1` | [À DÉCIDER — recommandé : conservation longue pour les actions sensibles] |
| Personnel Signa (rôles internes) | `internal_staff` | Contrôle d'accès interne | Personnel Signa (`super_admin`) | Supabase, `ca-central-1` | Durée d'emploi + [À DÉCIDER] |

## Notes

- Aucune donnée de démonstration ou fictive n'est mélangée aux données réelles depuis la Phase 3 (2026-09-12).
- Le paiement par carte n'est jamais reçu ni stocké par Signa : Stripe le traite directement (Signa ne voit que le statut d'abonnement).
- Les durées de conservation marquées `[À DÉCIDER]` doivent être fixées avant le pilote commercial, en tenant compte des obligations légales (ex. délais de prescription) et du principe de minimisation.
