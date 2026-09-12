# Tâches atomiques

## Terminées

- [x] Maquette visuelle CRM (React + TS) implantée depuis le design Claude Design — 2026-09-12
- [x] Déploiement pm2 (`signa-app`, port 3100) + nginx + SSL sur `app.signaweb.ca` — 2026-09-12
- [x] Correction DNS `app.signaweb.ca` (pointait vers le mauvais serveur) — 2026-09-12
- [x] Plan de développement complet rédigé et approuvé — 2026-09-12
- [x] `AGENTS.md` (Francis), `CLAUDE.md` (référence vers AGENTS.md) — 2026-09-12
- [x] Système de mémoire (`memory/memory.md`, `tasks.md`, `plans.md`, `file-index.md`) — 2026-09-12
- [x] Repo GitHub `groupe-reca/signa-app` créé et lié (temporaire, en attendant transfert vers `bastienfrank26`) — 2026-09-12

## Terminées (Phase 0) — 2026-09-12

- [x] Projet Supabase créé et lié via CLI (`mnadbkbdbjmugvsadeen`, région `ca-central-1`)
- [x] Migrations `organizations`, `memberships`, `invitations` + fonctions `is_org_member`/`is_org_admin`/`current_app_session` (security definer)
- [x] `features/auth` (SupabaseAuthGateway, AuthProvider, LoginPage, SignUpPage, ForgotPasswordPage, guards)
- [x] `features/organizations` (CreateOrganizationPage, onboarding minimal pour Phase 0)
- [x] react-router-dom ajouté : `/connexion`, `/inscription`, `/mot-de-passe-oublie` publiques ; `/*` protégé (RequireAuth → RequireOrganization → prototype CRM)
- [x] Isolation RLS vérifiée avec 2 comptes de test réels (via API admin Supabase, nettoyés après test) : un compte ne voit ni les organisations ni les memberships d'un autre, ne peut pas s'auto-insérer dans une organisation étrangère
- [x] Bug RLS trouvé et corrigé : `insert().select()` sur `organizations` échouait (policy SELECT dépendait de la membership insérée par trigger, non visible au moment du RETURNING) — fix : colonne `created_by` + policy SELECT alternative
- [x] Redéployé sur pm2/nginx (build + `pm2 restart signa-app`)

- [x] DNS `app.signaweb.ca` corrigé et stable — 2026-09-12
- [x] Parcours complet testé en vrai navigateur (Playwright/Chromium contre `app.signaweb.ca` en production) : redirection non-authentifié, mauvais mot de passe (message d'erreur affiché), bon login, création d'organisation, bascule vers le CRM, navigation Prospects/Pipeline, session qui persiste après reload — tout conforme — 2026-09-12

## Terminées (Phase 1) — 2026-09-12

- [x] Migrations `web_projects`, `project_steps`, `project_files`, `revision_requests`, `approvals` + RLS (`is_project_member`/`is_project_admin`)
- [x] Trigger : la création d'une organisation crée automatiquement son `web_project` (statut `awaiting_information`) + les 6 étapes standard — comble temporairement l'absence de Phase 2 (Signa qui crée le projet manuellement)
- [x] RPC `approve_project_version` : refuse si le projet n'est pas en `private_review`, insère l'approbation (immuable) et passe le projet à `approved`, le tout protégé par RLS (pas de security definer nécessaire)
- [x] Bucket Storage `project-files` (privé, chemin `{organization_id}/{web_project_id}/...`), RLS storage.objects par organisation
- [x] `features/portal` : `ProjectDashboardPage` (progression, version privée + approbation, fichiers, corrections, historique), branchée sur l'écran "Suivi du projet" du prototype existant
- [x] Vérifié par script (isolation RLS tables + storage entre 2 organisations) et en vrai navigateur (Playwright, production) : demande de correction, téléversement de fichier, passage en révision privée (simulé côté Signa via service role), approbation réelle confirmée en base

## Terminées (Phase 2) — 2026-09-12

- [x] Table `internal_staff` (rôles support/operations/billing_admin/super_admin), distincte des memberships clients — `is_internal_staff()`, `is_internal_admin()` (operations+super_admin seulement), `current_staff_role()`
- [x] Table `audit_events` : toute action admin sensible écrit un motif obligatoire (suspension, changement de statut projet, changement d'accès) via des RPC dédiées (`admin_set_organization_status`, `admin_set_project_status`, `admin_set_step_status`, `admin_update_membership`) — jamais d'écriture directe côté client
- [x] `organizations.status` (active/suspended) : suspension réduit l'accès (écriture bloquée sur revision_requests/project_files/approbation) sans effacer les données, testé
- [x] RPC `admin_organization_memberships` : seul moyen pour le personnel Signa de voir les courriels des membres (auth.users non exposé au client)
- [x] `features/admin` : console séparée (`/admin/organisations`, `/admin/organisations/:id`, `/admin/audit`), gardée par `RequireStaff` — un client normal qui y va voit "Accès refusé"
- [x] Vérifié par script (isolation cross-org, garde-fous de rôle, blocage/déblocage d'accès, audit) et en navigateur réel (Playwright, production) : suspension, réactivation, changement de statut de projet, étape marquée terminée, tout confirmé en base

## Terminées (Phase 3) — 2026-09-12

- [x] Migrations `pipelines`/`pipeline_stages`/`contacts`/`opportunities`/`activities`/`tasks`, RLS par organisation (`is_org_member`/`is_org_writer` — un membre `readonly` ne peut rien écrire), suspension bloque aussi les écritures CRM
- [x] Pipeline par défaut (6 étapes standard) auto-créé à la création d'une organisation, même patron que le projet web (Phase 1)
- [x] Trigger : gagner ou perdre une opportunité (changement vers une étape `is_won`/`is_lost`) génère automatiquement une activité, sans code applicatif
- [x] `features/crm` (domain/application/infrastructure/presentation) branché sur les composants visuels existants du prototype (`HomeScreen`, `ProspectsScreen`, `PipelineScreen`, `ProspectCard`, `ProspectDrawer`, `MobileView`) — **aucune refonte visuelle**, seulement le remplacement de `data/seed.ts` par de vraies requêtes Supabase dans `AppContext.tsx`
- [x] `data/seed.ts` supprimé (plus de données de démonstration mélangées à l'app réelle, conforme à AGENTS.md)
- [x] Nettoyage de vrais faux-semblants trouvés en cours de route : badge "Données de démonstration" retiré, nom/rôle d'organisation dans la sidebar et le header maintenant réels (étaient codés en dur : "Entreprise ABC", "Francis Roy"), la carte "Prochaine action" (accueil + mobile) montre le vrai statut du projet au lieu d'un texte fictif ("Approuver la page « À propos »" codé en dur, qui causait d'ailleurs une collision de bouton avec le vrai bouton d'approbation du portail — trouvé pendant les tests Phase 1)
- [x] Vérifié par script (isolation, rôle readonly bloqué en écriture, activité automatique gagné/perdu, blocage si compte suspendu) et en navigateur réel (Playwright, production) : ajout de prospect, activité, avancement d'étape, tout confirmé en base

## Écarts assumés par rapport à la doc (Phase 3)

- Pas de table `companies` séparée : `contacts.company_name` est un simple texte dénormalisé (le prototype ne distinguait pas les deux). Suffisant tant qu'une entreprise n'a pas besoin de plusieurs contacts liés ; à revisiter si ce besoin apparaît.
- Les couleurs d'étape de pipeline sont codées en front (`features/crm/domain/stageColors.ts`, par `stage_key`), pas en base — un pipeline renommé/réordonné reste fonctionnel mais une étape avec une clé inconnue retombe sur une couleur neutre.
- `useProjectBundle` est appelé indépendamment à plusieurs endroits d'un même écran (accueil) — plusieurs requêtes réseau redondantes. Fonctionnel, mais un cache partagé (ex. React Query) serait plus efficace si l'app grossit.

## Terminées (Phase 4) — 2026-09-12

- [x] Migrations `sites`/`api_keys`/`form_submissions` — exclusifs au personnel Signa (aucune policy client, ni lecture ni écriture)
- [x] RPC admin : `admin_create_site` (génère et hache la clé, secret retourné une seule fois), `admin_rotate_site_key`, `admin_set_site_status`, `admin_list_sites`
- [x] RPC `capture_site_submission_v1` : idempotence par `(site_id, idempotency_key)`, limite de débit (20/minute/site), création contact+opportunité+activité dans le pipeline par défaut de l'organisation
- [x] Edge Function `site-submissions` (`supabase/functions/site-submissions`, `--no-verify-jwt`) : authentification par clé de site hachée (`x-signa-site-key`), CORS par origine déclarée par site, champ piège anti-robot, limite de taille (16 Ko), consentement `privacy` obligatoire
- [x] Section "Sites" dans la fiche d'organisation de l'administration : création, affichage unique du secret + extrait d'intégration prêt à copier, rotation de clé, suspension/réactivation/révocation (motif obligatoire, audité)
- [x] **Faille de sécurité trouvée et corrigée en cours de route** : `capture_site_submission_v1` en `security definer` sans révocation explicite des privilèges par défaut de Supabase (`anon`/`authenticated` ont EXECUTE par défaut sur les nouvelles fonctions, indépendamment de PUBLIC) permettait à n'importe quel utilisateur authentifié de créer des prospects dans n'importe quelle organisation sans la clé de site. Corrigé par `revoke execute ... from anon, authenticated` explicite + vérifié par test d'intrusion (voir note ci-dessous)
- [x] Vérifié par script (idempotence, piège anti-robot, CORS bonne/mauvaise origine incluant le préflight, révocation de site, isolation) et en navigateur réel (Playwright, production) : création de site, secret affiché une fois, test d'intégration, apparition dans le CRM du client

## Note de sécurité pour les prochaines phases

**Toute nouvelle fonction Postgres qui insère/modifie des données sans vérifier explicitement l'autorisation dans son propre corps doit révoquer EXECUTE de `anon` ET `authenticated` explicitement** (pas seulement `PUBLIC` — Supabase accorde EXECUTE à ces deux rôles par défaut à la création, indépendamment de PUBLIC). Vérifier avec un test d'intrusion (utilisateur authentifié quelconque qui tente l'appel direct) avant de considérer une fonction sensible comme terminée. Toutes les fonctions existantes ont été auditées le 2026-09-12 ; seule `capture_site_submission_v1` avait ce problème.

## Terminées (Phase 5, partiel) — 2026-09-12

- [x] Docs produit copiées dans le dépôt (`docs/00` à `docs/14`, depuis le projet Design), annotées avec l'état réel d'implémentation à chaque section
- [x] `docs/14-DECISIONS.md` mis à jour : DEC-009 et DEC-012 remplacées (stack réelle : Vite/React/Supabase, pas Next.js/Cloudflare/Drizzle), nouvelles décisions DEC-015 à DEC-019 (inscription libre temporaire, sauvegardes à activer, Stripe en mode test)
- [x] Gabarits Loi 25 rédigés (`docs/loi25/politique-confidentialite.md`, `registre-traitements.md`, `procedure-incident.md`) — **brouillons, non validés légalement, champs `[À DÉCIDER]`/`[À DÉSIGNER]` à compléter avec un avocat avant publication**
- [x] Stripe : produit + 2 prix créés en **mode test** (129$/149$, `prod_VFOaESoM6OOPUz`), tables `plans`/`plan_prices`/`subscriptions`/`billing_events`, Edge Function `stripe-webhook` (signature vérifiée, idempotent par `stripe_event_id`), Edge Function `create-checkout-session` (staff seulement), `is_org_billing_active()` (calcule le droit d'accès mais **ne bloque encore rien** — décision produit à prendre)
- [x] Section "Abonnement" dans l'admin : statut, génération de lien de paiement
- [x] MFA TOTP en self-service (`/parametres/securite`, tous les utilisateurs) — enrôlement, QR code, vérification, désactivation
- [x] Révocation de session par le personnel Signa (`revoke-user-sessions`, motif obligatoire, audité), bouton dans la fiche membre de l'admin
- [x] Lien "Sécurité" et "Déconnexion" ajoutés au Header (absents auparavant)
- [x] **Deux bugs réels trouvés et corrigés pendant les tests Stripe** : (1) Stripe a déplacé `current_period_end` vers l'item d'abonnement dans les versions d'API récentes — le webhook plantait silencieusement sur chaque `customer.subscription.*` ; (2) `create-checkout-session` appelait un RPC gardé par `is_internal_staff()`/`auth.uid()` avec le rôle de service (qui n'a pas de session utilisateur) — corrigé par une lecture directe `memberships`+`auth.admin.getUserById`
- [x] Vérifié en navigateur réel (Playwright, production) : paiement Stripe complet avec vraie carte de test jusqu'au webhook et à la mise à jour de `subscriptions` ; MFA activé de bout en bout avec un vrai code TOTP généré ; garde-fous de rôle (client normal bloqué sur `create-checkout-session`)
- [x] Vérifié la disponibilité des sauvegardes Supabase via l'API de gestion : **aucune sauvegarde ni PITR activés sur le palier actuel** (`pitr_enabled: false`, `backups: []`) — test de restauration impossible tant que ce n'est pas activé (palier payant requis, DEC-018)

## Terminées (branche `design/mobile-nav`, hors phases) — 2026-09-12

- [x] Navigation mobile réelle du shell client/CRM (`Sidebar`/`Header`/`App.tsx`) — remplace le faux toggle Bureau/Mobile (cadre de téléphone dans la page). Barre d'onglets fixe (`MobileNav`) + feuille secondaire (`MobileMoreSheet`), seuil CSS 768 px (`.sg-desktop-only`/`.sg-mobile-only`), zone sûre iOS (`env(safe-area-inset-bottom)`)
- [x] Source unique de navigation `src/navigation.ts` (Sidebar + MobileNav + MobileMoreSheet lisent la même liste)
- [x] Composant `Button` factorisé (`src/components/ui/Button.tsx`) — comblait un vide documenté dans `docs/11-DESIGN-SYSTEM.md`
- [x] Nettoyage : `MobileView.tsx` supprimé, état `device`/`mTab`/`mStage` retiré de `AppContext.tsx`/`types.ts`, helpers `pillDark`/`mTabStyle` morts retirés de `ui.ts`
- [x] Vérifié : `tsc --noEmit` et `npm run build` passent; page `/connexion` capturée en 390 px et 1280 px sans erreur console

## À faire — suite de la navigation mobile

- [ ] Non couvert par cette passe (hors scope "navigation") : `ProspectsScreen` reste un tableau à défilement horizontal sous 768 px (pas de vraies cartes mobiles) ; `AdminLayout` (console interne Signa) n'est pas responsive — jugé acceptable car outil interne desktop
- [ ] Pas de test visuel authentifié réel de `MobileNav`/`MobileMoreSheet` dans cette session — aucun compte de test disponible et création d'un compte jetable via l'inscription publique non faite sans mandat (un seul projet Supabase partagé, pas de séparation dev/prod). À vérifier manuellement par Francis ou avec un compte de test explicite

## Terminées (Phase 6, partiel) — 2026-09-12

- [x] RPC `admin_pilot_metrics` + page `/admin/indicateurs` : organisations (total/actives/suspendues), projets par statut, soumissions de site (30j), organisations actives (7j), suivis en retard, abonnements par statut, sites actifs, actions admin (7j) — indicateurs du doc 13-ROADMAP
- [x] **Export CSV réel** dans Prospects — était un faux bouton (juste un toast, aucune donnée exportée) depuis le début du prototype ; génère maintenant un vrai fichier CSV téléchargé (BOM UTF-8, colonnes complètes), vérifié en navigateur réel (Playwright, téléchargement effectif, contenu vérifié)
- [x] **Bug de config réel trouvé par l'utilisateur en testant** : les liens de confirmation de courriel Supabase redirigeaient vers `http://localhost:3000` (réglage par défaut jamais changé) au lieu de `https://app.signaweb.ca`. Corrigé via l'API de gestion Supabase (`site_url`, `uri_allow_list`) — vérifié avec `generateLink` que le nouveau lien pointe bien vers le bon domaine
- [x] Page `/reinitialiser-mot-de-passe` construite — **elle n'existait pas du tout** avant ce correctif ; le lien "mot de passe oublié" envoyait vers une route inexistante depuis la Phase 0

## Ce que je ne peux pas faire pour la Phase 6

Le pilote (3 à 5 vraies entreprises, doc 13-ROADMAP) est une activité commerciale — recruter et accompagner de vrais clients — pas une tâche d'ingénierie. Ça revient à Francis. Ce que j'ai livré : l'outillage (indicateurs) et corrigé de vrais bugs qui auraient bloqué un vrai client dès l'inscription (lien de confirmation cassé).

## À faire avant de lancer un vrai pilote

- [ ] Voir la liste complète des décisions en attente (sauvegardes, Stripe production, Loi 25, grâce de paiement) dans les sections Phase 5 ci-dessus — aucune n'est bloquante pour *tester* avec des comptes de confiance, mais toutes le sont pour de vrais clients payants
- [ ] Vérifier s'il existe d'autres réglages Supabase par défaut jamais ajustés (courriels transactionnels — expéditeur, gabarits — n'ont pas été revus non plus)

## À faire (avant de clore la Phase 5)

- [ ] Webhooks sortants (table `webhook_deliveries`) non construits — reportés jusqu'à l'apparition d'un vrai besoin (aucun consommateur externe pour l'instant ; Stripe en Phase 5 est un webhook *entrant*, pas concerné)
- [ ] Détection de doublons de contacts (doc 06 : "signalés sans fusion destructive automatique") non implémentée — chaque soumission crée un nouveau contact, même si l'adresse courriel existe déjà
- [ ] Notifications (table dédiée) pas construites — une activité CRM sert d'équivalent visible pour l'instant, pas de courriel envoyé au client à la réception d'un prospect
- [ ] **DEC-018 (décision commerciale requise)** : passer le projet Supabase à un palier payant pour activer les sauvegardes/PITR — impossible de tester une restauration tant que ce n'est pas fait
- [ ] **DEC-019 (décision commerciale requise)** : recréer produit/prix Stripe en mode production (`sk_live_`/`pk_live_`) avant tout paiement réel, une fois les montants finaux confirmés
- [ ] `is_org_billing_active()` existe mais ne bloque rien — décision produit à prendre : qu'est-ce qui doit se passer concrètement quand un compte n'est plus payant (lecture seule ? blocage complet ? après combien de temps ?)
- [ ] Séparation dev/staging/prod inexistante — un seul projet Supabase sert à tout, y compris les tests de cette session (nettoyés après coup, mais risque réel si oublié)
- [ ] Courriels transactionnels (accueil, échec de paiement, etc.) non envoyés — pas de fournisseur SMTP configuré (voir aussi le point équivalent noté en Phase 0/1)
- [ ] Observabilité (erreurs, latence, alertes) non instrumentée — seuls les logs bruts Supabase existent
- [ ] Gabarits Loi 25 (`docs/loi25/`) à faire valider par un avocat, responsable de la protection des renseignements personnels à désigner, durées de conservation à trancher
- [ ] DEC-015 (inscription libre) contredit toujours DEC-003 (Signa crée le compte après paiement) — à trancher avant le pilote commercial

- [ ] Console admin ne permet pas encore de créer une organisation pour un client (le flux MVP réel : "Signa crée le compte après paiement", avec invitation) — reporté, dépend de la table `invitations` (existe depuis Phase 0, jamais utilisée) et d'un flux de rédemption côté client, non construits
- [ ] Sections Modules/Sites/Abonnements de l'administration pas construites — aucune table ne les supporte encore (Phase 3/4/5)
- [ ] Un membre du personnel Signa sans organisation qui visite `/` (au lieu de `/admin/...`) tombe sur l'écran de création d'organisation du client — angle mort mineur, pas bloquant (le personnel utilise `/admin/organisations` directement)

- [ ] Décider si l'inscription libre (`/inscription`) reste ouverte au public ou si elle doit être retirée avant le pilote (le MVP prévoit que Signa crée les comptes après paiement, pas un self-signup)
- [ ] Configurer un vrai fournisseur SMTP (Resend, comme `reca-app-v3`) dans Supabase Auth — le SMTP par défaut limite l'envoi de courriels de confirmation/réinitialisation à quelques par heure
- [ ] `project_steps` reste toujours à `pending` : rien ne les fait passer à `in_progress`/`done` pour l'instant — ce sera une action de l'administration Signa (Phase 2), pas du client
- [ ] Les transitions de `web_projects.status` (`content_review` → `in_production` → `private_review` → …) ne sont exposées nulle part côté client par design (seul `approve_project_version` peut faire avancer un statut, et seulement `private_review` → `approved`) — Phase 2 doit fournir la console qui les pilote (aujourd'hui seul le service role peut le faire, utilisé pour les tests)
- [ ] Notifications essentielles (accès créé, version prête, réponse correction, approbation demandée, site en ligne) pas encore implémentées — prévues avec un Edge Function d'envoi courriel (patron `resend-webhook` de `reca-app-v3`)
