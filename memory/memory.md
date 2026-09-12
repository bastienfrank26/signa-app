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

## État du prototype (2026-09-12)

Maquette visuelle complète du CRM livrée (Accueil variantes A/B, Prospects, Pipeline, tiroir prospect, modale nouveau prospect, vue mobile). 100 % état local (`AppContext.tsx`), aucune persistance, aucune authentification. Sert de base visuelle pour la Phase 3 (CRM réel) — pas de refonte visuelle prévue, seulement le branchement à Supabase.
