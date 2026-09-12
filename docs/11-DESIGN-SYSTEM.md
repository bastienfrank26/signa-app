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

Seuil unique bureau/mobile : **768 px** (`.sg-desktop-only` / `.sg-mobile-only` dans `src/styles/global.css`, piloté par vraie media query CSS, pas par un état JS).

- Bureau (≥768 px) : barre latérale stable (`Sidebar`).
- Mobile (<768 px) : barre d'onglets fixe en bas d'écran (`MobileNav`, hauteur `--sg-mobile-nav-height`, respecte `env(safe-area-inset-bottom)`) avec les sections les plus utilisées (Accueil, Prospects, Pipeline) + un onglet « Plus » qui ouvre une feuille (`MobileMoreSheet`) pour les sections secondaires, le compte et la déconnexion.
- La liste des sections de navigation vit une seule fois dans `src/navigation.ts` — `Sidebar`, `MobileNav` et `MobileMoreSheet` la lisent tous, aucune duplication d'écrans.
- Les écrans critiques fonctionnent à partir de 320 px.

> Note (2026-09-12, remplacée le même jour) : le prototype CRM simulait le mobile via un cadre de téléphone dans la même page (toggle Bureau/Mobile). Remplacé par une vraie navigation responsive (voir ci-dessus) ; `MobileView.tsx` et l'état `device`/`mTab`/`mStage` ont été retirés.

## Composants obligatoires

- boutons primaire, secondaire, discret et dangereux — composant `Button` factorisé (`src/components/ui/Button.tsx`), min. 44 px de hauteur par défaut; les écrans plus anciens gardent encore des styles inline équivalents, à migrer au fil de l'eau;
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
