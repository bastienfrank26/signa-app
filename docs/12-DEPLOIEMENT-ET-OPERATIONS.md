# Déploiement et opérations

## Environnements

| Environnement | Usage | Données | État réel |
| --- | --- | --- | --- |
| Local | développement et migrations | fictives uniquement | Un seul projet Supabase (`mnadbkbdbjmugvsadeen`) sert de facto de dev + prod — pas d'environnement séparé |
| Aperçu | validation d'une livraison | synthétiques | Non construit |
| Production | clients réels | protégées et sauvegardées | `app.signaweb.ca`, pm2 + nginx + certbot |

> Écart important (2026-09-12) : contrairement à l'intention d'origine, il n'y a **pas** de séparation dev/staging/prod — toutes les migrations sont poussées directement sur l'unique projet Supabase qui sert déjà de vraies organisations. Risque à corriger avant le pilote commercial (voir `memory/tasks.md`).

## Livraison

`main` est la branche stable. Livraison actuelle : `npm run build` (tsc + vite) local, puis `pm2 restart signa-app`. Pas de CI/CD automatisé (GitHub Actions, etc.) — déploiement manuel à chaque phase.

## Migrations

- écrites à la main (SQL), pas générées par un ORM (pas de Drizzle — voir `docs/14-DECISIONS.md`);
- appliquées via `supabase db push`;
- jamais modifiées après application (une correction = une nouvelle migration, pratiqué systématiquement, y compris pour corriger une faille de sécurité en Phase 4);
- pas de sauvegarde préalable systématique avant une migration risquée (dépend de l'activation des sauvegardes Supabase — voir doc 09).

## Observabilité

Non construite : pas de tableau de bord d'erreurs, de latence ou d'alertes. Les seuls signaux actuels sont les logs Supabase (Edge Functions, Postgres) consultables via le tableau de bord Supabase, et `audit_events`/`billing_events` pour les événements métier.

## Sauvegardes

**Non activées.** Le projet Supabase est sur un palier sans sauvegardes automatiques ni PITR au 2026-09-12. Décision commerciale requise (passer à un palier payant) avant de pouvoir tester une restauration ou avant le pilote — voir `memory/tasks.md`.

## Incident

1. Confirmer et classifier l'impact.
2. Contenir sans détruire les preuves.
3. Communiquer un état interne.
4. Restaurer ou revenir en arrière.
5. Évaluer les obligations de confidentialité (voir `docs/loi25/procedure-incident.md`).
6. Informer les personnes appropriées.
7. Documenter cause, correction et prévention.

Aucun incident réel à ce jour ; procédure non exercée par simulation.

## Vérifications après livraison

Faites manuellement à chaque phase (voir `memory/tasks.md`) : connexion, accès organisation, écriture/lecture d'une donnée contrôlée, soumission d'un formulaire d'essai, état des intégrations et webhooks. Pas encore automatisé en suite de tests permanente (les scripts de vérification sont écrits puis supprimés à chaque phase).

## Exploitation quotidienne

La console admin (`/admin/organisations`) montre les organisations et leur statut projet, mais pas encore de vue agrégée "comptes bloqués / paiements en problème / formulaires en échec" — à construire si le volume le justifie.
