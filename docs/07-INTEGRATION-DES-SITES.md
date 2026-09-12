# Intégration des sites clients

## Objectif

Francis peut fabriquer chaque site à la main, puis le connecter à `signa-app` depuis l'administration sans modifier le code de la plateforme.

## Modèle d'accès

Chaque site possède :

- un `siteId` public et stable;
- des origines autorisées;
- une clé secrète affichée une seule fois pour les appels serveur;
- un état actif, suspendu ou révoqué;
- des destinations configurées, comme CRM ou Appels de service (seule `crm` existe pour l'instant).

Seul le hachage d'une clé est stocké (SHA-256). La rotation crée une nouvelle clé et révoque l'ancienne.

## API implémentée

`POST https://mnadbkbdbjmugvsadeen.supabase.co/functions/v1/site-submissions/{siteId}`

En-tête `x-signa-site-key` (clé secrète en clair, jamais dans le code source public du site — voir extrait fourni par la console admin).

```json
{
  "formKey": "contact-principal",
  "idempotencyKey": "5c1e...",
  "contact": {
    "name": "Alex Tremblay",
    "email": "alex@example.ca",
    "phone": "+14185550123"
  },
  "message": "J'aimerais recevoir une estimation.",
  "consent": {
    "privacy": true,
    "marketing": false
  },
  "context": {
    "pageUrl": "https://exemple.ca/contact",
    "utmSource": "google"
  }
}
```

Réponse : `202` avec identifiant de soumission, sans révéler si le contact existe.

## Traitement

1. Vérifier le site, l'accès (clé) et l'état.
2. Appliquer limite de débit (20/minute/site) et champ piège anti-robot.
3. Valider et normaliser le corps (schéma strict).
4. Dédupliquer par clé d'idempotence.
5. Enregistrer le minimum requis (`form_submissions`).
6. Créer l'objet métier configuré (contact + opportunité CRM).
7. Produire une activité (pas encore de notification/courriel — voir doc 05).

## Sécurité

- Préférer les appels serveur à serveur — le vrai usage attendu est un `fetch()` navigateur depuis le site client, protégé par CORS + clé.
- Ne jamais placer une clé secrète dans JavaScript public accessible sans contrôle CORS.
- CORS n'est pas une authentification à lui seul — la clé de site reste la vraie barrière.
- Limiter taille (16 Ko), champs, et fréquence.

## Configuration interne

L'administration (`/admin/organisations/:id`, section Sites) crée le site, autorise les domaines, gère les clés (rotation, suspension, révocation) et permet un test d'intégration côté serveur (sans dépendre du navigateur, pour éviter le blocage CORS attendu depuis la console elle-même).

## Webhooks sortants

Non construits (`webhook_deliveries`). Aucun consommateur externe n'existe pour l'instant — à construire quand un vrai besoin apparaît.

## Versionnage

Route publique actuelle non versionnée explicitement dans l'URL (`site-submissions`, pas `v1`). À revoir avant un changement incompatible.
