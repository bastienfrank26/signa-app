# 03 — Modèle de données

Dernière mise à jour : 2026-09-12

## Principe général

Le CRM Signa fonctionne en multi-organisation.

Toutes les données métier doivent être reliées à une `organization_id` et protégées par les politiques RLS Supabase.

Le serveur et les fonctions sécurisées doivent déterminer les droits d’accès. Une simple valeur d’organisation envoyée par le navigateur ne constitue jamais une autorisation.

## État actuel

Le CRM possède déjà notamment :

- `contacts`;
- `pipelines`;
- `pipeline_stages`;
- `opportunities`;
- `activities`;
- `tasks`.

Une opportunité CRM est actuellement liée à un contact.

La propriété `company_name` du contact est dénormalisée. Il n’existe pas encore de table `companies` séparée.

Cette structure reste acceptable pour le MVP tant qu’un besoin réel de gestion de plusieurs contacts par entreprise n’apparaît pas.

## Contact

Le contact représente la personne.

Champs minimums cibles :

```text
contacts
- id
- organization_id
- first_name
- last_name
- display_name
- company_name
- email
- phone
- lifecycle_status
- owner_user_id
- created_at
- updated_at
```

### Champs recommandés à ajouter ou confirmer

#### `email_normalized`

Courriel normalisé pour recherche et déduplication.

Exemple :

`Jean.Tremblay@Exemple.ca` → `jean.tremblay@exemple.ca`

#### `phone_normalized`

Téléphone au format normalisé.

Exemple :

`(514) 555-1234` → `+15145551234`

#### `lifecycle_status`

Valeurs proposées :

- `prospect`;
- `client`;
- `inactive`.

Il ne remplace pas l’étape d’opportunité.

Un contact peut être un client et avoir plus tard une nouvelle opportunité.

#### `owner_user_id`

Membre responsable du contact lorsque pertinent.

## Opportunité

L’opportunité représente une occasion d’affaires.

Champs cibles :

```text
opportunities
- id
- organization_id
- contact_id
- pipeline_id
- stage_id
- title
- estimated_value_cents
- currency
- source
- source_detail
- site_id
- form_key
- landing_page
- utm_source
- utm_medium
- utm_campaign
- owner_user_id
- next_follow_up_at
- won_at
- lost_at
- created_at
- updated_at
```

Tous les champs ci-dessus ne doivent pas nécessairement être ajoutés en une seule migration.

La règle importante est de conserver l’origine de l’opportunité dès sa création.

## Source du prospect

Clés proposées :

```text
website
phone
email
referral
facebook
instagram
google
door_to_door
import
other
```

`source_detail` permet de garder une précision supplémentaire.

Exemples :

- `formulaire-demande-soumission`;
- `facebook-organique`;
- `google-ads`;
- `référence-client`.

## Provenance web

Lorsqu’une soumission vient d’un site Signa, conserver lorsque disponible :

```text
site_id
form_key
page_url
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

Les paramètres non présents doivent rester `NULL`.

## Activités

`activities` constitue la timeline CRM.

Types cibles :

```text
prospect_created
site_submission_received
note
call
email
stage_changed
task_created
task_completed
owner_changed
won
lost
converted_to_client
```

Chaque activité doit pouvoir conserver :

```text
- id
- organization_id
- contact_id
- opportunity_id
- type
- body
- created_by
- created_at
- metadata
```

`metadata` peut être JSONB uniquement pour de petites données structurées variables.

Les champs fréquemment filtrés doivent rester dans des colonnes normales.

## Tâches

Champs cibles :

```text
tasks
- id
- organization_id
- contact_id
- opportunity_id
- assigned_to
- created_by
- type
- title
- description
- due_at
- priority
- status
- completed_at
- created_at
- updated_at
```

Types proposés :

- `call`;
- `email`;
- `quote`;
- `follow_up`;
- `appointment`;
- `other`.

Statuts proposés :

- `todo`;
- `done`;
- `cancelled`.

## Détection de doublons

### Normalisation

Avant toute recherche de doublon :

1. trim du courriel;
2. lowercase du courriel;
3. suppression des caractères de présentation du téléphone;
4. conversion du téléphone au format E.164 lorsque possible.

### Recherche

Un doublon potentiel est signalé lorsque le même `organization_id` possède :

- le même `email_normalized`; ou
- le même `phone_normalized`.

Une correspondance de courriel est généralement plus forte qu’une correspondance de téléphone partagé.

### Index recommandés

```text
(organization_id, email_normalized)
(organization_id, phone_normalized)
(organization_id, lifecycle_status)
(organization_id, owner_user_id)
```

Ne pas créer immédiatement de contrainte UNIQUE stricte sur courriel ou téléphone :

- certaines familles partagent un numéro;
- certaines entreprises utilisent une adresse générique;
- les données historiques peuvent déjà contenir des doublons.

## Gestion d’une soumission web en doublon

Flux recommandé :

1. chercher un contact de la même organisation par courriel normalisé;
2. sinon chercher par téléphone normalisé;
3. si un contact fiable existe, le réutiliser;
4. créer une nouvelle opportunité si la demande représente une nouvelle occasion;
5. créer une activité `site_submission_received`;
6. conserver la soumission brute dans `form_submissions`;
7. ne jamais écraser silencieusement les coordonnées existantes sans règle explicite.

## Conversion en client

La conversion ne doit pas dupliquer le contact.

Flux recommandé :

```text
opportunité gagnée
→ lifecycle_status du contact = client
→ won_at sur l’opportunité
→ activité converted_to_client
```

Si le contact est déjà client :

- conserver `client`;
- marquer simplement la nouvelle opportunité comme gagnée.

## Relations avec les intégrations de sites

`form_submissions` doit permettre de retrouver :

- le site;
- la clé d’idempotence;
- le contact créé/réutilisé;
- l’opportunité créée;
- le statut de traitement;
- les données utiles de provenance.

La soumission brute doit être conservée de manière limitée et conforme aux règles de conservation.

## Sécurité

Toutes les nouvelles tables CRM doivent :

- porter `organization_id`;
- avoir RLS activé;
- utiliser les helpers d’autorisation existants;
- bloquer l’écriture aux rôles lecture seule;
- bloquer l’écriture lorsque l’organisation est suspendue;
- être testées avec au moins deux organisations.

Toute fonction PostgreSQL `security definer` qui modifie des données doit révoquer explicitement `EXECUTE` à `anon` et `authenticated` lorsqu’elle ne doit pas être appelée directement.

## Migrations

Toute évolution suit le patron :

1. nouvelle migration;
2. aucune modification rétroactive d’une migration déjà appliquée;
3. ajout de colonnes nullable si nécessaire;
4. remplissage/migration des données;
5. ajout d’index;
6. ajout de contraintes seulement après validation des données existantes.

## Évolution future

Lorsque le besoin réel apparaîtra, ajouter :

- `companies`;
- plusieurs contacts par entreprise;
- adresses;
- devis;
- factures;
- communications;
- scoring;
- automatisations;
- consentements marketing plus détaillés.
