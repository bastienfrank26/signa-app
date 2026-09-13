# 06 — Module CRM

Dernière mise à jour : 2026-09-12

## Objectif

Le CRM Signa doit permettre à une petite entreprise de :

- recevoir ses prospects;
- entrer manuellement un prospect;
- conserver les coordonnées;
- voir l’origine de chaque demande;
- suivre le prospect dans un pipeline;
- savoir quelle action effectuer ensuite;
- conserver l’historique;
- convertir une vente gagnée en client.

Le CRM doit rester simple à utiliser et être adapté aux entrepreneurs et petites équipes.

## État réel actuel

Le CRM réel est déjà branché à Supabase.

Fonctions déjà présentes :

- contacts;
- opportunités;
- pipelines;
- étapes;
- activités;
- tâches;
- liste de prospects;
- pipeline Kanban;
- fiche prospect;
- création manuelle;
- écran Contacts;
- création de contact;
- fiche contact;
- notes;
- tâches;
- formulaires provenant des sites;
- export CSV.

La priorité de cette évolution est donc d’enrichir le CRM existant, pas de le reconstruire.

## Concept central

Le CRM distingue :

### Contact

La personne.

### Opportunité

La possibilité de vente.

### Prospect

Dans l’interface, le mot « prospect » peut représenter l’ensemble :

> contact + opportunité active

Un même contact peut avoir plusieurs opportunités dans le temps.

## Deux portes d’entrée obligatoires

### 1. Formulaire provenant du site internet

Un site client transmet une demande à Signa.

Le système :

1. authentifie le site;
2. valide la demande;
3. normalise le courriel et le téléphone;
4. vérifie les doublons;
5. crée ou réutilise le contact;
6. crée une opportunité;
7. inscrit la source;
8. crée une activité;
9. rend le prospect visible dans le CRM.

### 2. `+ Ajouter un prospect`

Un utilisateur connecté peut créer manuellement un prospect.

Le formulaire doit comporter :

#### Identité

- prénom;
- nom;
- entreprise.

#### Coordonnées

- courriel;
- téléphone.

#### Vente

- source;
- valeur estimée;
- étape initiale;
- responsable;
- prochaine relance.

#### Contexte

- notes.

Le formulaire doit être rapide.

Les champs peu utilisés ne doivent pas surcharger l’interface principale.

## Courriel et téléphone

Le courriel et le téléphone doivent être visibles :

- dans la fiche prospect;
- dans la fiche contact;
- dans le formulaire de création;
- dans les résultats de recherche lorsque pertinent;
- sur les cartes mobiles lorsque l’espace le permet.

Ils doivent être cliquables :

- `mailto:` pour le courriel;
- `tel:` pour le téléphone.

## Sources

Le CRM doit conserver la source d’acquisition.

Sources standards :

- Site web;
- Téléphone;
- Courriel;
- Référence;
- Facebook;
- Instagram;
- Google;
- Porte-à-porte;
- Import;
- Autre.

Un prospect provenant d’un site doit automatiquement être marqué `Site web`.

## Sous-source

La sous-source permet de préciser :

- formulaire;
- page;
- campagne;
- publicité;
- recommandation.

Exemple :

```text
Source : Site web
Formulaire : Demande de soumission
Page : /services/plomberie
UTM source : google
UTM campaign : plomberie-laval
```

## Détection de doublons

La détection des doublons devient une fonctionnalité obligatoire du CRM.

Critères initiaux :

- courriel normalisé;
- téléphone normalisé.

### Création manuelle

Si une correspondance est trouvée :

```text
Ce prospect existe peut-être déjà.

Jean Tremblay
jean@example.ca
514-555-1234

[Ouvrir la fiche]
[Créer quand même]
```

Aucune fusion destructive automatique.

### Soumission web

Pour une correspondance forte :

- réutiliser le contact existant;
- créer une nouvelle opportunité si nécessaire;
- ajouter l’activité liée à la nouvelle demande.

Une demande répétée ne doit pas être perdue simplement parce que le contact existe déjà.

## Pipeline

Pipeline par défaut cible :

```text
Nouveau
À contacter
Contacté
Qualifié
Soumission
Négociation
Gagné
Perdu
```

Le projet possède déjà un pipeline en production.

Ne pas remplacer brutalement les étapes existantes.

Si une évolution du pipeline par défaut est nécessaire :

- préserver les organisations existantes;
- ajouter/migrer les étapes de façon explicite;
- ne jamais casser les clés utilisées par le front.

## Kanban

Le pipeline doit permettre :

- déplacement entre étapes;
- affichage du nom;
- valeur;
- source;
- prochaine relance;
- responsable;
- indicateur de retard.

Le mobile doit utiliser des cartes adaptées plutôt qu’un tableau desktop simplement compressé.

## Fiche prospect

Sections recommandées :

### Résumé

- nom;
- entreprise;
- courriel;
- téléphone;
- source;
- valeur;
- étape;
- responsable.

### Prochaine action

- type;
- échéance;
- état.

### Notes

Ajout de note rapide.

### Historique

Timeline chronologique.

### Opportunités

Lorsque le contact possède plusieurs occasions d’affaires.

## Timeline

Événements à afficher :

- création;
- formulaire reçu;
- note;
- appel;
- courriel;
- changement d’étape;
- tâche;
- relance;
- assignation;
- gagné;
- perdu;
- conversion client.

L’activité doit indiquer :

- type;
- date;
- auteur lorsque pertinent;
- description.

## Tâches et relances

Le CRM possède déjà des tâches.

À compléter :

- liaison claire prospect/contact;
- assignation à un autre membre;
- type d’action;
- échéance;
- priorité;
- retard;
- vue personnelle.

Types :

- Appeler;
- Courriel;
- Soumission;
- Relance;
- Rendez-vous;
- Autre.

## Responsable

Une opportunité doit pouvoir avoir un responsable.

Version initiale :

- assignation manuelle.

Version suivante :

- règles automatiques;
- round-robin;
- assignation par source;
- assignation par service.

## Prospect gagné → Client

Quand une opportunité passe à `Gagné` :

1. conserver l’opportunité;
2. conserver tout l’historique;
3. marquer le contact comme client;
4. enregistrer la date de gain;
5. créer une activité de conversion.

Ne jamais recréer une deuxième fiche client identique.

## Opportunité perdue

Lors du passage à `Perdu`, permettre éventuellement :

- raison de perte;
- note;
- possibilité de relance future.

Raisons futures possibles :

- prix;
- aucun retour;
- concurrent;
- projet annulé;
- hors territoire;
- mauvais prospect;
- autre.

## Tableau de bord

Indicateurs utiles :

- nouveaux prospects;
- prospects à contacter;
- suivis en retard;
- valeur du pipeline;
- ventes gagnées;
- taux de conversion;
- prospects par source;
- délai moyen avant premier suivi.

Éviter un tableau de bord trop complexe dans le MVP.

## Automatisations

Après stabilisation :

### Exemple 1

```text
Nouveau prospect web
→ créer opportunité
→ créer activité
→ créer tâche « Appeler »
```

### Exemple 2

```text
Opportunité gagnée
→ contact devient client
→ activité de conversion
```

### Exemple 3

```text
Aucune activité depuis X jours
→ créer une tâche de relance
```

## Fonctions futures

Prévoir sans construire immédiatement :

- scoring;
- courriels bidirectionnels;
- SMS;
- téléphonie;
- séquences;
- modèles de courriel;
- automatisations complexes;
- résumé IA;
- suggestion IA de prochaine action.

## Critères de livraison

Cette évolution CRM est terminée lorsque :

- le formulaire manuel inclut courriel et téléphone;
- le formulaire web crée ou rattache correctement le contact;
- la source est toujours conservée;
- la détection des doublons fonctionne;
- le prospect possède une timeline;
- les tâches peuvent être liées au prospect;
- le responsable est géré;
- le pipeline est utilisable sur mobile;
- une opportunité gagnée peut convertir le contact en client;
- les écritures restent isolées par organisation;
- les rôles lecture seule ne peuvent pas modifier les données;
- les parcours principaux sont testés dans un vrai navigateur.
