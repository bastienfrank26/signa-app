# Modules métiers

## Objectif

Un module transforme le noyau Signa pour un usage précis sans créer une application séparée. Chaque organisation possède un module principal inclus et pourra éventuellement acheter des ajouts.

## Contrat d'un module

Chaque module déclare :

- une clé stable, un nom et une version;
- les rôles autorisés;
- ses routes et éléments de navigation;
- ses paramètres validés;
- ses droits fonctionnels;
- les événements consommés et produits;
- ses critères d'activation, suspension et retrait.

Le registre central est la seule source de vérité. Une entrée de navigation n'est pas une autorisation.

> Note (2026-09-12) : ce registre central (`module_catalog`) n'existe pas encore. Le CRM (Phase 3) est actuellement branché en dur, pas via un registre de modules activables. À construire avant d'ajouter un deuxième module (Rendez-vous ou Appels de service).

## Cycle de vie

| État | Comportement |
| --- | --- |
| `trial` | Accessible jusqu'à l'échéance |
| `active` | Accessible selon le forfait et les rôles |
| `past_due` | Accès temporaire selon la grâce |
| `suspended` | Lecture limitée ou blocage, sans suppression |
| `cancelled` | Inactif; export et rétention contrôlés |

L'activation est idempotente. La désactivation ne détruit pas les données.

## Catalogue initial

### CRM

Contacts, opportunités, pipeline, activités, tâches et suivis.

### Rendez-vous

Services, employés ou ressources, disponibilités, rendez-vous, rappels et absences.

### Appels de service

Demandes, priorité, adresse, affectation, visite, photos, notes et état.

### Soumissions et factures

Extension future partagée, sans chercher à remplacer un logiciel comptable complet.

## Objets communs

| Besoin | Objet du noyau |
| --- | --- |
| Client ou prospect | Contact et entreprise |
| Employé responsable | Membre et assignation |
| Rappel | Tâche et notification |
| Document ou photo | Fichier |
| Historique | Activité et audit |
| Demande du site | Soumission et événement |

## Règles d'extension

- Ajouter un module seulement si le besoin est récurrent et monétisable.
- Préférer la configuration à une branche de code par métier.
- Ne pas charger le noyau d'un champ utile à une seule industrie.
- Prévoir import, export et suppression des données du module.
- Tester activation, autorisation et désactivation indépendamment.
