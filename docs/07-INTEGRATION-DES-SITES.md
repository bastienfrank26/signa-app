# 07 — Intégration des sites clients

Dernière mise à jour : 2026-09-12

## Objectif

Les sites web construits par Signa doivent pouvoir transmettre automatiquement leurs demandes au CRM de la bonne organisation.

Le propriétaire de Signa doit pouvoir connecter un site à `signa-app` sans demander à un développeur de modifier manuellement le CRM.

## État réel actuel

L’intégration de sites existe déjà.

Le projet possède :

- table `sites`;
- table `api_keys`;
- table `form_submissions`;
- création/rotation/révocation des clés;
- Edge Function publique `site-submissions`;
- contrôle CORS par origine;
- clé de site;
- limite de taille;
- piège anti-robot;
- consentement confidentialité;
- idempotence;
- limite de débit;
- création contact + opportunité + activité.

Cette documentation décrit l’évolution attendue de cette intégration.

## Flux principal

```text
Visiteur
  ↓
Formulaire du site
  ↓
Edge Function site-submissions
  ↓
Validation / sécurité
  ↓
Normalisation
  ↓
Détection de doublon
  ↓
Contact créé ou réutilisé
  ↓
Opportunité créée
  ↓
Activité créée
  ↓
CRM du client
```

## API publique

Route logique existante :

```text
POST /site-submissions/{siteId}
```

L’implémentation réelle passe par Supabase Edge Functions.

Authentification :

```text
x-signa-site-key
```

La clé secrète :

- est affichée une seule fois à la création/rotation;
- est stockée hachée;
- ne doit jamais apparaître dans Git;
- ne doit jamais être exposée dans du JavaScript public si un appel serveur est possible.

## Payload recommandé

```json
{
  "formKey": "demande-soumission",
  "idempotencyKey": "uuid-ou-cle-unique",
  "contact": {
    "firstName": "Jean",
    "lastName": "Tremblay",
    "company": "Construction Tremblay",
    "email": "jean@example.ca",
    "phone": "+15145551234"
  },
  "message": "J'aimerais recevoir une estimation.",
  "consent": {
    "privacy": true,
    "marketing": false
  },
  "context": {
    "pageUrl": "https://client.ca/services/plomberie",
    "referrer": "https://www.google.com/",
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "plomberie-laval",
    "utmContent": null,
    "utmTerm": null
  }
}
```

Les anciens payloads compatibles doivent continuer de fonctionner tant qu’une migration explicite n’est pas décidée.

## Champs minimums

Une soumission doit idéalement fournir :

- nom;
- courriel ou téléphone;
- consentement confidentialité;
- `formKey`;
- `idempotencyKey`.

Un message ou les détails propres au métier peuvent être ajoutés.

## Source CRM

Toute soumission provenant de cette API doit créer une opportunité avec :

```text
source = website
```

Et conserver lorsque possible :

```text
source_detail = formKey
site_id
page_url
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

## Normalisation des coordonnées

Avant toute déduplication :

### Courriel

- trim;
- lowercase.

### Téléphone

- retirer les caractères de formatage;
- normaliser au format E.164 lorsque possible.

Les valeurs d’origine peuvent être conservées pour affichage si nécessaire.

## Détection de doublons

Actuellement, chaque soumission peut créer un nouveau contact.

Cette logique doit être améliorée.

### Algorithme cible

1. rechercher dans la même organisation un contact avec le même courriel normalisé;
2. sinon rechercher par téléphone normalisé;
3. si correspondance fiable :
   - réutiliser le contact;
4. sinon :
   - créer le contact;
5. créer une nouvelle opportunité pour la demande;
6. créer l’activité;
7. lier `form_submissions` au contact et à l’opportunité.

### Important

Ne jamais fusionner automatiquement deux contacts existants.

L’API doit seulement décider :

- réutiliser un contact fiable;
- ou créer un nouveau contact.

## Idempotence

L’idempotence protège contre la répétition technique de la même soumission.

Une même paire :

```text
(site_id, idempotency_key)
```

ne doit pas créer deux opportunités.

Cette règle est différente de la détection de doublon CRM.

### Exemple

Un visiteur clique deux fois sur Envoyer :

- même `idempotencyKey`;
- une seule soumission métier.

Le même client revient trois mois plus tard :

- nouvelle `idempotencyKey`;
- même contact possible;
- nouvelle opportunité.

## Activité créée

Chaque demande valide doit créer une activité de type :

```text
site_submission_received
```

Contenu recommandé :

```text
Demande reçue depuis le formulaire « Demande de soumission ».
```

La timeline doit permettre de retrouver :

- date;
- formulaire;
- page;
- message;
- source/campagne lorsque disponible.

## Notification / relance

Évolution recommandée après le traitement du prospect :

```text
nouvelle soumission
→ créer tâche « Contacter le prospect »
```

Échéance configurable, par exemple :

- immédiatement;
- dans 1 heure;
- le prochain jour ouvrable.

La première version peut utiliser les tâches CRM avant de créer un moteur d’automatisations complet.

## Sécurité

Les protections actuelles doivent être conservées :

- clé de site hachée;
- CORS par origine;
- antispam;
- limite de taille;
- rate limit;
- consentement confidentialité;
- idempotence;
- statut actif/suspendu/révoqué.

### Règle Supabase critique

Toute fonction PostgreSQL sensible utilisée par l’Edge Function doit être auditée.

Si une fonction `security definer` peut modifier des données sans vérifier elle-même l’utilisateur final :

```sql
REVOKE EXECUTE ON FUNCTION ... FROM anon;
REVOKE EXECUTE ON FUNCTION ... FROM authenticated;
```

Cette règle doit être testée explicitement.

## Réponses API

Réponse de succès recommandée :

```json
{
  "ok": true,
  "submissionId": "..."
}
```

Ne pas révéler publiquement :

- si le contact existait déjà;
- l’identifiant interne du contact;
- l’organisation;
- le pipeline;
- les détails CRM.

## Administration Signa

L’administration doit permettre :

- créer un site;
- choisir l’organisation;
- déclarer les origines;
- afficher la clé une fois;
- copier un exemple d’intégration;
- tester l’intégration;
- faire une rotation de clé;
- suspendre;
- réactiver;
- révoquer.

## Intégration sans développeur

À terme, l’objectif est que Francis puisse :

1. créer le site dans Signa;
2. copier le `siteId`;
3. copier la clé;
4. coller l’extrait prévu dans le site client;
5. envoyer un test;
6. vérifier immédiatement que le prospect apparaît.

Aucune intervention dans le code de `signa-app` ne doit être nécessaire pour chaque nouveau client.

## Critères de livraison de l’évolution

- le courriel est conservé;
- le téléphone est conservé;
- la source est automatiquement `website`;
- `formKey` est conservé;
- les UTM utiles sont conservés;
- les doublons sont détectés;
- un contact existant peut être réutilisé;
- une nouvelle demande crée toujours une nouvelle opportunité lorsque nécessaire;
- l’idempotence reste fonctionnelle;
- la sécurité actuelle n’est pas affaiblie;
- les tests incluent bonne clé, mauvaise clé, mauvaise origine, doublon, idempotence et organisation étrangère.
