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

- Repo officiel : `bastienfrank26/signa-app` (remote `official`). Le remote `origin` (`groupe-reca/signa-app`) reste synchronisé aussi, mais toute nouvelle décision doit considérer `official`/`bastienfrank26` comme la source de vérité (confirmé par Francis le 2026-09-13). Toujours pousser sur les deux tant que `origin` existe.

## Projet Supabase (mis à jour 2026-09-13)

**Changement majeur** : la base est passée du projet `mnadbkbdbjmugvsadeen` à `txhzmnglcvmsbwgmuiwa` (compte Pro personnel de Francis, voir `signa-docs/memory/decisions.md`). Schéma (19 migrations + `modules`/`organization_modules` de `signa-core`) réappliqué sur le nouveau projet, **vide au départ** — donc **toutes les données de l'ancien projet sont perdues** (pas de dump/restore fait, juste les migrations de structure). Les comptes de test permanents documentés ci-dessous (`admin@signaweb.ca`, `bastienfrancis1@gmail.com`, etc.) **n'existent plus** sur le nouveau projet — à recréer si nécessaire avant de les réutiliser. `.env.local` de ce repo et de `signa-core` pointent déjà vers le nouveau projet.

Nouveau compte de test créé le 2026-09-13 sur le nouveau projet, pour valider `signa-core` et le SSO cookie (voir `signa-core/memory/tasks.md` pour l'identifiant exact). Mot de passe non inscrit ici (règle AGENTS.md).

## Décisions ouvertes

- DEC-013 (durée de grâce après paiement échoué) : à fixer avec l'équipe commerciale, avant Phase 5.
- DEC-014 (premier module après CRM, Rendez-vous vs Appels de service) : à trancher selon les clients pilotes, en Phase 6.
- Transfert du repo GitHub vers `bastienfrank26` : à faire quand l'accès sera possible.

## Compte de test permanent (2026-09-12)

`bastienfrancis1@gmail.com` / organisation « Audit navigation mobile — test » créés pour auditer le shell mobile authentifié avec Playwright, avec mandat explicite de Francis. **Permanent** : aucune fonction de suppression de compte/organisation n'existe dans ce repo (pas de clé service-role, pas de RPC delete — seulement `admin_set_organization_status` qui suspend). Réutiliser ce compte pour les futurs audits authentifiés plutôt que d'en créer un nouveau (inscription publique exige confirmation courriel, pas automatisable seul).

Ce même compte est aussi maintenant membre `owner` d'une deuxième organisation permanente « Client Invitation Test » (créée en testant le flux admin d'invitation, voir `tasks.md`). Un utilisateur peut appartenir à plusieurs organisations — l'app choisit `session.memberships[0]` sans ordre garanti ni sélecteur d'organisation, donc après connexion ce compte peut atterrir sur l'une ou l'autre organisation selon l'ordre retourné.

## Comptes de test permanents (mis à jour 2026-09-13)

Francis a demandé de garder ces comptes **tant que l'application n'est pas terminée** — ne pas les supprimer, les réutiliser pour tous les futurs tests Playwright plutôt que d'en créer de nouveaux. Mots de passe **non inscrits ici** (règle AGENTS.md §3 : jamais de secret dans Git) — conservés uniquement dans la mémoire locale hors dépôt de l'agent :

- **Staff (`internal_staff`, rôle `operations`)** : `admin@signaweb.ca` — donne accès à `/admin/*`. Courriel confirmé et mot de passe forcés directement en base (compte non destiné à recevoir de vrais courriels).
- **Client** : `bastienfrancis1@gmail.com` — propriétaire de « Audit navigation mobile — test » et « Client Invitation Test ».

Ne pas confondre avec `bastienfrancis9999@gmail.com` : ce n'est **pas** un compte de test jetable, c'est un compte réel déjà existant, propriétaire de l'organisation « Groupe RÉCA » — découvert en essayant de le réutiliser (demande initiale de Francis), jamais modifié suite à cette découverte (mot de passe non touché, aucun rôle staff ajouté).

## Accès base de données Supabase (2026-09-12, mis à jour 2026-09-13)

**`.input/supabase` (à la racine du repo) contient déjà une chaîne de connexion Postgres directe** (`postgresql://postgres...@...pooler.supabase.com:5432/postgres`) — ne pas oublier son existence, ne pas redemander un token à Francis avant d'avoir vérifié ce fichier. Attention : `cat`/`ls`/`grep` dessus sans précaution est bloqué par le mode auto (« Credential Leakage ») et peut faire fuiter le mot de passe dans la sortie d'une commande (arrivé une fois avec un `source` sur une ligne mal formée — le mot de passe est apparu en clair dans un message d'erreur). Méthode sûre : extraire la valeur dans une variable sans jamais l'afficher, ex. `DB_URL=$(grep '^postgres' .input/supabase)`, puis l'utiliser directement dans `npx supabase db query --db-url "$DB_URL" "<sql>"` (marche aussi pour `db push`, mais `db push` utilise plutôt `--linked` avec un `SUPABASE_ACCESS_TOKEN` — pas trouvé dans `.input/supabase`, qui ne contient que la chaîne Postgres directe. Si un `SUPABASE_ACCESS_TOKEN` est nécessaire pour `db push --linked`/`projects list`, il faut le redemander à Francis, à faire écrire dans un fichier `/tmp/....env` — jamais collé dans le chat).

Écrire/modifier la base directement (`UPDATE`/`INSERT` sur `auth.users`, `internal_staff`, etc.) déclenche systématiquement une confirmation du mode auto (« Modify Shared Resources », « Credential Materialization ») — normal et voulu, redemander confirmation explicite à Francis à chaque fois plutôt que de contourner.

**Piège découvert** : le `user_id` retourné par `supabase.auth.signUp()` côté client ne correspond pas toujours à l'`id` réel de la ligne dans `auth.users` (observé deux fois) — toujours revérifier par une requête `select id from auth.users where email = ...` avant d'utiliser cet id ailleurs (ex. `internal_staff.user_id`), sinon la contrainte FK échoue.

**Piège découvert** : `crypt(motdepasse, encrypted_password) = encrypted_password` permet de vérifier si un mot de passe Supabase Auth correspond, sans l'exposer — utile pour diagnostiquer un échec de connexion avant de réinitialiser. Réinitialiser un mot de passe se fait par `update auth.users set encrypted_password = crypt('nouveau_mdp', gen_salt('bf')) where email = '...'`.

## Navigation mobile et design system (2026-09-12, branche `design/mobile-nav`)

Décision : le shell client/CRM avait une navigation mobile factice (cadre de téléphone + toggle JS Bureau/Mobile dans `App.tsx`/`MobileView.tsx`), pas de vraie media query. Remplacé par une vraie navigation responsive (barre d'onglets bas d'écran + feuille « Plus », seuil CSS 768 px) et un premier composant `Button` factorisé, comme point de départ du design system réel (`docs/11-DESIGN-SYSTEM.md` mis à jour). Détail dans `tasks.md`. Reste explicitement hors scope de cette passe : `ProspectsScreen` (toujours défilement horizontal sous 768 px) et `AdminLayout` (console interne, non responsive, jugé acceptable).

## SSO / session partagée (2026-09-13, Phase 2 signa-docs)

Client Supabase (`src/infrastructure/supabase/client.ts`) migré de `createClient` (localStorage) vers `createBrowserClient` de `@supabase/ssr`, avec cookie `domain: .signaweb.ca` en production (omis en local, hôte ne finit pas par `signaweb.ca`). Validé via Playwright en prod : cookie `sb-*-auth-token` avec `domain=.signaweb.ca`, `secure`, `sameSite=Lax`; `localStorage` vide.

**Logout global déjà acquis sans code additionnel** : `client.auth.signOut()` (défaut `scope: 'global'` dans auth-js) révoque déjà toutes les sessions serveur, et le cookie partagé disparaît pour tout `*.signaweb.ca` dans ce navigateur. Testé : après déconnexion, un ancien JWT est rejeté (401) par `signa-core`. Aucune seconde app réelle n'existe encore pour prouver la reconnaissance de session cross-app en conditions réelles (signa-admin/signa-crm pas créés) — le mécanisme (cookie domaine + vérification JWT côté signa-core, indépendante de l'origine) est en place et validé au niveau technique.

## État du prototype (2026-09-12)

Maquette visuelle complète du CRM livrée (Accueil variantes A/B, Prospects, Pipeline, tiroir prospect, modale nouveau prospect, vue mobile). 100 % état local (`AppContext.tsx`), aucune persistance, aucune authentification. Sert de base visuelle pour la Phase 3 (CRM réel) — pas de refonte visuelle prévue, seulement le branchement à Supabase.
