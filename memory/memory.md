# Mémoire — décisions durables et contexte

## Stack

- Front-end : Vite + React 18 + TypeScript. Pas Next.js, pas Cloudflare Workers/D1 (remplace DEC-009 du projet Design).
- Backend : Supabase (Postgres + Auth + Storage + Edge Functions). Répond à DEC-012.
- Hébergement : VPS avec pm2 + nginx, même patron que les projets `reca-*`. `signa-app` sert le build statique via `pm2 serve dist 3100 --spa`, nginx proxy `app.signaweb.ca` (SSL Let's Encrypt/certbot, renouvellement auto).
- Architecture front cible : `src/features/<nom>/{domain,application,infrastructure/supabase,presentation}`, patron copié de `reca-app-v3/src/features/*` (ex. `clients`, `auth`).

## Infrastructure existante

- pm2 process `signa-app` (port 3100), sauvegardé (`pm2 save`).
- nginx : `/etc/nginx/sites-available/signa-app`, HTTPS actif, redirect HTTP→HTTPS.
- Domaine `app.signaweb.ca` : A record doit être 185.172.64.13. Corrigé une première fois le 2026-09-12, mais a reviré vers 74.208.236.245 (mauvaise IP) le même jour, après le déploiement Phase 0. Revérifier après toute correction DNS avant de conclure que c'est stable (`getent ahosts app.signaweb.ca` depuis le serveur).

## GitHub

- Repo officiel visé par AGENTS.md : `bastienfrank26/signa-app` — mais le compte `gh` connecté sur ce serveur est `groupe-reca`, sans accès à `bastienfrank26`.
- Décision temporaire (2026-09-12) : repo créé sous `groupe-reca/signa-app` (privé) en attendant transfert de propriété vers `bastienfrank26`.

## Décisions ouvertes

- DEC-013 (durée de grâce après paiement échoué) : à fixer avec l'équipe commerciale, avant Phase 5.
- DEC-014 (premier module après CRM, Rendez-vous vs Appels de service) : à trancher selon les clients pilotes, en Phase 6.
- Transfert du repo GitHub vers `bastienfrank26` : à faire quand l'accès sera possible.

## Compte de test permanent (2026-09-12)

`bastienfrancis1@gmail.com` / organisation « Audit navigation mobile — test » créés pour auditer le shell mobile authentifié avec Playwright, avec mandat explicite de Francis. **Permanent** : aucune fonction de suppression de compte/organisation n'existe dans ce repo (pas de clé service-role, pas de RPC delete — seulement `admin_set_organization_status` qui suspend). Réutiliser ce compte pour les futurs audits authentifiés plutôt que d'en créer un nouveau (inscription publique exige confirmation courriel, pas automatisable seul).

Ce même compte est aussi maintenant membre `owner` d'une deuxième organisation permanente « Client Invitation Test » (créée en testant le flux admin d'invitation, voir `tasks.md`). Un utilisateur peut appartenir à plusieurs organisations — l'app choisit `session.memberships[0]` sans ordre garanti ni sélecteur d'organisation, donc après connexion ce compte peut atterrir sur l'une ou l'autre organisation selon l'ordre retourné.

## Accès base de données Supabase (2026-09-12)

Un agent dans cet environnement n'a normalement **aucun accès** à la base (pas de `SUPABASE_ACCESS_TOKEN`, pas de session `supabase login`, pas de mot de passe DB — vérifié en début de session). Francis peut fournir un token temporairement : le faire écrire dans un fichier (`/tmp/....env`), jamais coller le secret dans le chat (resterait dans l'historique). Une fois chargé (`source` + `export`), `supabase db push --linked` applique les migrations et `supabase db query --linked "<sql>"` interroge/modifie directement — deux capacités puissantes à utiliser avec le même mandat explicite que toute action irréversible (ex. : promouvoir temporairement un compte en `internal_staff` pour tester l'admin a demandé une autorisation explicite séparée, refusée d'abord par le mode auto). Supprimer le fichier de token après usage — pas persistant, à refournir à la prochaine session.

## Navigation mobile et design system (2026-09-12, branche `design/mobile-nav`)

Décision : le shell client/CRM avait une navigation mobile factice (cadre de téléphone + toggle JS Bureau/Mobile dans `App.tsx`/`MobileView.tsx`), pas de vraie media query. Remplacé par une vraie navigation responsive (barre d'onglets bas d'écran + feuille « Plus », seuil CSS 768 px) et un premier composant `Button` factorisé, comme point de départ du design system réel (`docs/11-DESIGN-SYSTEM.md` mis à jour). Détail dans `tasks.md`. Reste explicitement hors scope de cette passe : `ProspectsScreen` (toujours défilement horizontal sous 768 px) et `AdminLayout` (console interne, non responsive, jugé acceptable).

## État du prototype (2026-09-12)

Maquette visuelle complète du CRM livrée (Accueil variantes A/B, Prospects, Pipeline, tiroir prospect, modale nouveau prospect, vue mobile). 100 % état local (`AppContext.tsx`), aucune persistance, aucune authentification. Sert de base visuelle pour la Phase 3 (CRM réel) — pas de refonte visuelle prévue, seulement le branchement à Supabase.
