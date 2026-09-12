# AGENTS.md — Signa App

Ce fichier est l’autorité principale pour tout agent IA ou développeur qui travaille dans ce dépôt.

## 1. Mission du produit

`signa-app` est l’application client universelle de Signa pour les PME québécoises. Elle n’est pas un CRM isolé et ne doit jamais devenir une application propre à un seul métier.

La plateforme combine :

- un portail client Signa;
- un noyau commun multi-entreprise;
- des modules métiers activables;
- une administration interne Signa;
- une API simple reliant les sites web fabriqués manuellement à l’application.

Le forfait Entreprise coûte 129 $/mois avec engagement annuel ou 149 $/mois sans engagement. Il inclut le site web et un module principal choisi par le client. Les premiers modules prévus sont CRM, Rendez-vous et Appels de service.

## 2. Sources de vérité

Lire dans cet ordre avant toute modification importante :

1. `AGENTS.md`
2. `memory/memory.md`
3. `memory/tasks.md`
4. `memory/plans.md`
5. les documents pertinents dans `docs/`
6. le code concerné

En cas de conflit : instruction explicite de Francis > `AGENTS.md` > décision documentée > mémoire > code existant.

## 3. Règles non négociables

- Construire une plateforme multi-organisation dès le départ.
- Isoler toutes les données par `organizationId` côté serveur.
- Ne jamais faire confiance à un identifiant d’organisation fourni seulement par le navigateur.
- Garder le noyau commun indépendant des modules métiers.
- Un module doit être activé par un droit d’accès explicite, jamais par une simple option visuelle.
- Les sites clients restent séparés de `signa-app` et transmettent leurs demandes par une API documentée.
- Ne jamais placer de secret, clé API ou donnée client réelle dans Git.
- Ne jamais modifier les données de production, déployer ou changer la facturation sans mandat explicite.
- Toute migration appliquée est immuable. Corriger avec une nouvelle migration.
- Tout texte visible destiné aux clients doit être en français québécois clair et sans jargon.

## 4. Façon de travailler

Avant de coder :

1. vérifier les tâches et décisions existantes;
2. identifier le flux utilisateur touché;
3. confirmer si le changement appartient au noyau, au portail, à l’administration ou à un module;
4. produire un plan court pour toute modification dépassant un seul fichier.

Pendant le travail :

- faire des changements petits, cohérents et réversibles;
- préserver les conventions et composants existants;
- mettre les contrôles d’autorisation sur le serveur;
- prévoir les états chargement, vide, erreur et succès;
- maintenir une expérience mobile complète;
- mettre à jour les types, validations, schéma et documentation ensemble.

Avant de terminer :

- exécuter la compilation;
- générer et inspecter les migrations si le schéma change;
- vérifier qu’aucune donnée ne peut traverser d’une organisation à une autre;
- vérifier les parcours touchés sur mobile et bureau;
- mettre à jour les quatre fichiers de mémoire;
- mettre à jour `memory/file-index.md` si des fichiers sont ajoutés, déplacés ou supprimés.

## 5. Architecture obligatoire

Séparer conceptuellement :

- **Noyau** : organisations, utilisateurs, rôles, contacts, activités, fichiers, notifications et droits d’accès.
- **Portail client** : paiement, informations d’entreprise, fichiers, production du site, corrections, approbation et mise en ligne.
- **Modules** : fonctions métiers activables sans duplication du noyau.
- **Administration Signa** : clients, abonnements, modules, opérations et soutien.
- **Intégrations** : API des formulaires, webhooks et services externes.

Les modules ne doivent pas importer directement l’interface d’un autre module. Les échanges passent par le noyau et des contrats typés.

## 6. Qualité produit

- Interface professionnelle, rapide, accessible et mobile-first.
- Utiliser le design system Signa documenté dans `docs/11-DESIGN-SYSTEM.md`.
- Actions principales évidentes dans le premier écran.
- Cibles tactiles d’au moins 44 px lorsque pertinent.
- Aucun bouton trompeur : une action inactive doit être identifiée comme telle.
- Messages d’erreur utiles sans révéler de détails techniques ou secrets.
- Données réalistes uniquement comme démonstration clairement identifiable.

## 7. Sécurité et conformité

- Authentification et autorisation sont distinctes.
- Valider toutes les entrées côté serveur.
- Limiter les requêtes publiques, journaliser les événements importants et rendre les opérations sensibles auditables.
- Minimiser les renseignements personnels et prévoir export, correction et suppression.
- Respecter les principes de la Loi 25 décrits dans `docs/09-SECURITE-ET-LOI-25.md`.

## 8. Git et livraisons

- Branche stable : `main`.
- Commits courts, descriptifs et centrés sur un résultat.
- Ne pas mélanger une refonte, une migration et une fonctionnalité sans nécessité.
- Ne jamais réécrire l’historique partagé sans autorisation.
- Le dépôt GitHub officiel est `bastienfrank26/signa-app`.
- `signa-landing` demeure un projet séparé.

## 9. Système de mémoire

- `memory/plans.md` : plans actifs, phases et prochaines étapes.
- `memory/tasks.md` : tâches atomiques et état réel.
- `memory/memory.md` : décisions durables, contraintes et contexte.
- `memory/file-index.md` : carte maintenue des fichiers importants.

Ne jamais inscrire une hypothèse comme une décision. Toute décision modifiée doit conserver une note courte expliquant le remplacement.
