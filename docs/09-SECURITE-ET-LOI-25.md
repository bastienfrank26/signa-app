# Sécurité et Loi 25

Ce document guide la conception technique; il ne remplace pas un avis juridique adapté à Signa. Les gabarits de travail Loi 25 (politique de confidentialité, registre des traitements, procédure incident) sont dans `docs/loi25/` — **à faire valider par un avocat avant toute publication**.

## Principes

- minimiser les renseignements recueillis;
- limiter l'accès au besoin réel;
- protéger les données pendant le transport et au repos;
- rendre les actions sensibles traçables;
- prévoir incidents, exports et suppressions;
- vérifier les fournisseurs et lieux de traitement.

## Authentification et autorisation

Construit (Phase 0) : Supabase Auth, courriel + mot de passe, MFA TOTP disponible en self-service (`/parametres/securite`, Phase 5), expiration de session automatique (JWT), révocation de session par le personnel Signa (`revoke-user-sessions`, Phase 5).

Chaque route serveur (via Row Level Security Postgres, pas une couche applicative séparée) :

1. identifie l'utilisateur (`auth.uid()`);
2. résout son appartenance active (`is_org_member`);
3. vérifie rôle et droit d'écriture (`is_org_writer`, `is_org_admin`);
4. impose l'organisation aux requêtes (chaque table filtre par `organization_id`);
5. audite les opérations sensibles (`audit_events`, actions admin).

## Protection applicative

- validation stricte côté Edge Function (zod-like) pour les entrées publiques;
- requêtes paramétrées (Postgres/Supabase client, pas de SQL concaténé);
- CSP/en-têtes de sécurité : non configurés explicitement (à faire, nginx);
- limites de débit sur l'API publique (`site-submissions`, 20/minute/site) — pas sur la connexion elle-même (délégué à Supabase Auth);
- secrets hors de Git (`.gitignore` : `.env*`, `.input/`).

## Isolation multi-organisation

Vérifiée par script à chaque phase (voir `memory/tasks.md`) : tentative de lecture/écriture croisée entre deux organisations, pour chaque domaine (organisations, projets, CRM, sites, facturation). Une faille réelle a été trouvée et corrigée en Phase 4 (fonction `security definer` sans révocation explicite des privilèges par défaut) — voir la note de sécurité dans `memory/tasks.md`.

## Vie privée

Voir `docs/loi25/` pour les gabarits. Statut au 2026-09-12 :

- responsable de la protection des renseignements personnels : **à désigner**;
- politique de confidentialité : gabarit rédigé, non publié, non validé légalement;
- registre des traitements : gabarit rédigé;
- consentement : recueilli pour les formulaires de site (`consent.privacy` obligatoire) ; pas de flux self-service pour accès/rectification/suppression;
- durées de conservation : **non définies**.

## Journalisation

`audit_events` couvre les actions admin sensibles (suspension, changement de statut, révocation, accès). Aucun mot de passe, jeton ou clé complète n'est journalisé (seul `key_prefix` est conservé pour les clés de site).

## Incidents

Voir `docs/loi25/procedure-incident.md`.

## Sauvegardes

Statut au 2026-09-12 : le projet Supabase est sur un palier sans sauvegardes automatiques ni PITR (`pitr_enabled: false`, aucune sauvegarde listée). **Décision commerciale requise** : passer à un palier payant pour activer les sauvegardes avant le pilote — voir `memory/tasks.md`.

## Vérification avant pilote

- revue des rôles et routes — en continu à chaque phase;
- test d'isolation — fait à chaque phase;
- test de l'API publique — fait (Phase 4);
- analyse des téléversements — non fait (pas d'antivirus/scan sur `project-files`);
- rotation des secrets — mécanisme construit (sites), pas encore exercé pour les clés Supabase/Stripe elles-mêmes;
- restauration d'une sauvegarde — impossible tant que les sauvegardes ne sont pas activées;
- simulation d'incident — non fait;
- inventaire des fournisseurs — Supabase (ca-central-1), Stripe, ce serveur (pm2/nginx).
