# Administration Signa

## Rôle

La console interne (`/admin/*`) permet d'exploiter les comptes sans toucher directement au code ou à la base de données. Elle est séparée de l'espace client et réservée aux employés autorisés (table `internal_staff`, distincte des `memberships` clients).

## Fonctions MVP

| Section | Capacités | État (2026-09-12) |
| --- | --- | --- |
| Organisations | rechercher, créer, consulter, suspendre et rétablir | Construit en entier (2026-09-12) — bouton « + Créer un client » (`CreateClientModal.tsx`) crée l'organisation et une invitation (RPC `admin_create_organization_with_invitation`), le lien est affiché pour envoi manuel (aucun SMTP configuré) |
| Accès | inviter, retirer et gérer les rôles | Gestion de rôle/statut construite (RPC `admin_update_membership`) ; invitation par courriel pas construite (mais la primo-invitation par lien, ci-dessus, l'est) |
| Projets web | voir étape, blocages, fichiers et approbations | Construit |
| Modules | attribuer, configurer, suspendre et voir les droits | Non construit (un seul module, CRM, câblé en dur) |
| Sites | créer un `siteId`, gérer origines et clés, tester | Construit (Phase 4) |
| Abonnements | voir l'état Stripe, les événements et la grâce | Construit (Phase 5) : statut, génération de lien de paiement |
| Soutien | consulter les demandes et ajouter une note interne | Non construit |
| Audit | filtrer les opérations sensibles | Construit (liste seulement, pas encore de filtres) |

> Note (2026-09-12) : le premier utilisateur invité par Signa devient `owner` (comme un créateur en self-signup) — la contrainte `invitations.role` a été élargie pour l'accepter (migration `20260912200000`). Le personnel Signa qui crée l'organisation n'en devient jamais membre (correctif du trigger `handle_new_organization`). Page cliente : `/accepter-invitation?token=...`, valide 7 jours, réservée à l'utilisateur dont le courriel correspond à l'invitation.

## Fiche d'organisation

Résume membres, projet web (statut + étapes), sites intégrés, abonnement. Forfait/module/alertes pas encore résumés (dépend des sections non construites ci-dessus).

## Permissions internes

Rôles internes distincts des rôles clients (`internal_staff.role`) : `support`, `operations`, `billing_admin`, `super_admin`. Seuls `operations` et `super_admin` peuvent agir (suspendre, changer un statut, révoquer une clé) — `support` et `billing_admin` ont accès en lecture seulement pour l'instant (moindre privilège).

## Voir comme le client

Non construit. Aucune fonction d'usurpation, silencieuse ou non.

## Actions dangereuses

Suspension, révocation de clé, changement de statut de projet et changement d'accès demandent confirmation et motif obligatoire (`ReasonDialog`), et sont auditées (`audit_events`). La suspension conserve les données.

## Exploitabilité

- Recherche par nom construite ; filtres/pagination avancés non construits.
- Événements Stripe rejouables sans doublon (`billing_events`, idempotent par `stripe_event_id`).
- Modifications sensibles avec acteur, cible, heure et motif — construit.

## Critères d'acceptation

- un employé peut suspendre/rétablir un client sans développeur — atteint;
- un rôle insuffisant ne voit ni n'appelle une action interdite — atteint et vérifié par test d'intrusion (voir `memory/tasks.md`, Phase 4);
- toutes les opérations sensibles sont auditables — atteint;
- les données réelles ne sont jamais copiées dans une démonstration — sans objet (plus de données de démonstration dans l'app, Phase 3).
