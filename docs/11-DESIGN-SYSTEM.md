# Design system Signa

## Identité

- Marque : Signa.
- Signature : « Marquez votre présence en ligne ».
- Ton : direct, rassurant, local, concret et sans jargon.
- Police : Manrope; Inter en remplacement.

## Couleurs

| Jeton | Valeur | Usage |
| --- | --- | --- |
| `navy-900` | `#0F1B2D` | navigation, texte fort, fonds sombres |
| `orange-500` | `#E8521A` | action principale et accent |
| `cream-50` | `#F5F2EC` | fond chaleureux |
| `slate-400` | `#8899AA` | texte secondaire et bordures |
| `navy-700` | `#1D2E42` | surfaces foncées et survols |

Ajouter des tons accessibles de succès, avertissement, erreur et information. La couleur n'est jamais le seul indicateur.

Implémenté dans `src/styles/global.css` (variables CSS) et `src/ui.ts` (helpers de style).

## Hiérarchie

- Une action principale maximum par zone.
- Titres courts décrivant la tâche.
- Cartes pour regrouper une décision, pas pour décorer.
- Densité modérée adaptée aux propriétaires occupés.

## Mise en page

Sur bureau, barre latérale stable. Sur mobile, navigation compacte et actions secondaires dans des menus ou feuilles. Les écrans critiques fonctionnent à partir de 320 px.

> Note (2026-09-12) : le prototype CRM simule le mobile via un cadre de téléphone dans la même page (toggle Bureau/Mobile), pas encore via de vraies media queries responsives. Fonctionnel pour la démonstration, à revoir pour une vraie expérience mobile native du navigateur.

## Composants obligatoires

- boutons primaire, secondaire, discret et dangereux — construits (styles inline cohérents, pas de composant `<Button>` unique factorisé);
- champs avec étiquette, aide et erreur — construits (`formStyles.ts`);
- tableau avec version mobile — construit (Prospects);
- badges d'état avec libellé — construits;
- confirmation pour action risquée — construit (`ReasonDialog`, motif obligatoire);
- squelettes de chargement — non construits (texte "Chargement…" simple);
- états vide, erreur et succès — construits sur les écrans principaux;
- notifications non bloquantes — construit (`Toast`);
- fil d'activité et téléversement — construits (portail, CRM).

## Accessibilité

- viser WCAG 2.2 AA — non audité formellement;
- contraste dans tous les états — non vérifié systématiquement;
- clavier complet et focus visible — non vérifié systématiquement;
- cibles tactiles d'environ 44 px — respecté sur les boutons principaux (portail, mobile);
- étiquettes pour lecteurs d'écran — partiel;
- réduction des animations — non implémenté (`prefers-reduced-motion` non géré);
- erreurs près du champ et résumées au besoin — construit sur les formulaires principaux.

## Rédaction

Préférer « Ajouter un prospect » à « Créer une entité CRM ». Les boutons utilisent un verbe. Les erreurs disent ce qui est arrivé et quoi faire. Éviter jargon et anglicismes inutiles.

## Démonstration

Une action indisponible indique pourquoi. Les données fictives portent « Démonstration » et ne se mélangent pas aux données client — sans objet depuis la Phase 3 : l'application ne contient plus de données fictives, tout est réel (créé par les utilisateurs ou l'administration).
