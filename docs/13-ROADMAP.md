# Feuille de route

## Stratégie

Construire verticalement : livrer un parcours complet avant d'élargir le catalogue. La plateforme universelle vient de contrats communs solides, pas de plusieurs modules incomplets.

## Phases

| Phase | Résultat | État (2026-09-12) |
| --- | --- | --- |
| 0. Fondation | prototype, identité, données et documentation | **Terminée** |
| 1. Portail | paiement à mise en ligne | **Terminée** (le déclenchement par paiement réel reste partiel, voir doc 05) |
| 2. Administration | exploitation sans accès direct aux données | **Terminée** (organisations, accès, projets, audit ; modules/sites à l'époque non construits, sites ajoutés en Phase 4) |
| 3. CRM | module principal vendable | **Terminée** |
| 4. Intégrations | connexion autonome des sites | **Terminée** |
| 5. Production | auth, Stripe, courriel, sécurité, sauvegardes | **En cours** — MFA, révocation de session et Stripe construits ; courriels transactionnels, sauvegardes actives et Loi 25 publiée restent à faire |
| 6. Pilote | 3 à 5 entreprises réelles | Pas commencée |
| 7. Expansion | Rendez-vous puis Appels de service | Pas commencée |

Détail complet par phase : `memory/tasks.md` et `memory/plans.md`.

## Après le pilote

Le choix entre Rendez-vous et Appels de service se fonde sur les clients prêts à payer (DEC-014, toujours à confirmer).

## Critères de priorité

- bloque paiement ou activation;
- protège données ou conformité;
- complète un parcours commencé;
- retire une intervention technique répétitive;
- répond à plusieurs clients confirmés.

## Indicateurs

Suivre temps d'activation, complétion du portail, soumissions reçues, utilisateurs hebdomadaires, suivis à temps, incidents, soutien et résiliation. Non instrumenté automatiquement — à faire en Phase 5/6 (observabilité).
