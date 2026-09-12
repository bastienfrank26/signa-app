# Abonnements et paiements

## Offre connue

Le forfait Entreprise est offert à 129 $/mois avec engagement annuel ou 149 $/mois sans engagement. Il comprend le service web Signa et un module principal. Prix, taxes et inclusions finales restent configurables et doivent être confirmés commercialement.

> Note (2026-09-12) : produit et prix créés en **mode test** Stripe (`prod_VFOaESoM6OOPUz`, `price_1UEtnV...` à 129 $, `price_1UEtnW...` à 149 $) pour construire et vérifier l'intégration. **À recréer en mode production** (clés `sk_live_`/`pk_live_`) avant tout paiement réel — voir `memory/tasks.md`. L'« engagement annuel » n'est pas appliqué contractuellement par Stripe (pas de `subscription_schedule`) : c'est pour l'instant une distinction de prix seulement.

## Modèle

| Concept | Responsabilité | Table |
| --- | --- | --- |
| Plan | conditions commerciales et limites | `plans` |
| Prix | montant, devise, intervalle et engagement | `plan_prices` |
| Abonnement | relation d'une organisation avec Stripe | `subscriptions` |
| Événement | trace idempotente d'un changement externe | `billing_events` |

## Source de vérité

Stripe est la source des paiements, factures et moyens de paiement. Signa conserve un miroir opérationnel (`subscriptions`) et calcule les droits depuis des événements webhook signés (`stripe-webhook`). L'interface ne décide jamais seule qu'un paiement a réussi.

## Cycle implémenté

1. Le personnel Signa génère un lien de paiement Stripe Checkout pour une organisation (console admin, section Abonnement).
2. Stripe traite le paiement.
3. Un webhook signé (`customer.subscription.*`) est traité une seule fois (`billing_events`, unique par `stripe_event_id`).
4. `subscriptions` est mis à jour (statut, prix, échéance).
5. Droit d'accès dérivé via `is_org_billing_active()` (actif si `trialing`/`active`/`past_due`).

> Écart par rapport à la vision d'origine : ce n'est pas encore le client qui choisit et paie lui-même (pas de page de paiement publique) — c'est une action du personnel Signa. Pas encore de courriel d'accueil automatique à la confirmation du paiement.

## États

`incomplete`, `incomplete_expired`, `trialing`, `active`, `past_due`, `canceled`, `unpaid`, `paused` — reflètent directement les statuts Stripe.

`is_org_billing_active()` traduit ces états en droit d'accès : actif pour `trialing`/`active`/`past_due`. La durée de grâce précise après un paiement échoué (DEC-013) reste à trancher avec l'équipe commerciale — actuellement, `past_due` est traité comme actif indéfiniment (pas de bascule automatique vers un accès réduit après X jours).

**Important** : ce droit d'accès (`is_org_billing_active`) n'est pas encore appliqué pour bloquer l'accès au portail ou au CRM en cas d'organisation non payante — c'est une donnée disponible, pas encore une restriction active. Décision produit à prendre avant le pilote commercial.

## Webhooks

- signature vérifiée sur le corps brut (HMAC-SHA256, comme Stripe le prescrit);
- identifiant unique stocké (`billing_events.stripe_event_id`), répétitions ignorées;
- traitement et réception séparés (`processed_at` distinct de la réception).

## Échecs et résiliation

Non construit : relances, courriels d'échec de paiement, page de résiliation en libre-service. `past_due` et `canceled` sont capturés par le webhook mais n'entraînent pas encore d'action automatique côté Signa (courriel, blocage).

## Administration

Le personnel Signa (`operations`/`super_admin`) génère les liens de paiement et consulte le statut d'abonnement depuis la fiche d'organisation. Crédits, remboursements et changements manuels se font directement dans Stripe pour l'instant (pas d'action dédiée dans la console Signa).
