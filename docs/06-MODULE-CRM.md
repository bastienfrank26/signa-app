# Module CRM

## But

Le CRM permet à une petite équipe de recevoir chaque demande, savoir où elle en est et effectuer le prochain suivi sans lourdeur.

## Utilisateurs

- le propriétaire supervise le pipeline;
- l'administrateur configure les étapes et l'équipe;
- l'employé traite ses prospects et tâches;
- le rôle lecture seule consulte sans modifier.

## Modèle fonctionnel

| Objet | Données minimales |
| --- | --- |
| Contact | nom, courriel, téléphone, source, consentement pertinent |
| Entreprise | nom, coordonnées, contacts liés |
| Opportunité | pipeline, étape, valeur, propriétaire, probabilité, échéance |
| Activité | type, note, auteur, date, objet lié |
| Tâche | responsable, échéance, priorité, état |

Un contact n'est pas une opportunité. Il peut avoir plusieurs occasions d'affaires.

> Note (2026-09-12) : « Entreprise » est un champ texte dénormalisé sur `contacts` (`company_name`), pas une table séparée — voir `memory/tasks.md`. Suffisant tant qu'une entreprise n'a pas besoin de plusieurs contacts liés.

## Pipeline initial

`Nouveau`, `À contacter`, `Qualifié`, `Proposition`, `Gagné`, `Perdu`.

Les étapes peuvent être renommées ou réordonnées. Gagner ou perdre produit une activité (automatique, par déclencheur en base).

## Entrées

- formulaire du site (Edge Function `site-submissions`, Phase 4);
- création manuelle;
- import CSV validé (non construit);
- intégration future autorisée.

Les doublons sont signalés sans fusion destructive automatique — non implémenté : chaque soumission crée un nouveau contact même si le courriel existe déjà.

## Vues

- aperçu avec nouveaux prospects, valeur et suivis en retard;
- liste filtrable;
- pipeline adapté au mobile;
- fiche avec coordonnées, occasions, activités et fichiers — **fichiers non construits** (aucune table CRM pour ça, contrairement aux coordonnées/occasions/activités, construites le 2026-09-12);
- liste personnelle de tâches — construite (`TasksScreen.tsx`, filtres À faire/En retard/Terminées/Toutes, création, bascule fait/à faire).

> Note (2026-09-12) : écrans Contacts (`ContactsScreen.tsx`/`ContactDrawer.tsx`/`NewContactModal.tsx`, hook `useContacts.ts`) et Tâches (`TasksScreen.tsx`/`NewTaskModal.tsx`, réutilise `AppContext` puisque les tâches faisaient déjà partie du `CrmBundle`) construits — tables `contacts`/`tasks` déjà en place depuis Phase 3, seules les vues manquaient. Fichiers reste un stub (`StubScreen.tsx`).

## Règles

- Toute donnée est limitée à l'organisation active (RLS).
- Les valeurs sont en cents et portent une devise.
- Étapes, assignations et suppressions sont historisées (activités).
- Les exports suivent les permissions.

## Indicateurs

- nouveaux prospects par période et source;
- valeur active par étape;
- taux de conversion;
- délai avant premier suivi;
- tâches échues.

## Critères de livraison

- une demande du site apparaît dans la bonne organisation;
- elle peut être assignée, suivie et conclue;
- aucun rôle limité ne contourne l'API (RLS `is_org_writer` bloque le rôle `readonly`);
- recherche, filtres et export fonctionnent;
- états vide, chargement et erreur complets;
- données de démonstration séparées (aucune donnée fictive dans les comptes réels).
