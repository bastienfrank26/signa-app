# 01 — Périmètre et MVP

Dernière mise à jour : 2026-09-12

## Objectif

Le MVP vendable de Signa doit permettre à une petite entreprise québécoise de recevoir des prospects, les suivre, les convertir en clients et conserver un historique commercial simple, sans exiger plusieurs logiciels.

Le CRM doit rester simple, rapide et utilisable par une petite équipe. Il ne doit pas chercher à reproduire HubSpot, Salesforce ou Zoho dans leur totalité.

Le principe produit est :

> Toute demande entrante ou saisie manuellement devient un prospect dans un seul CRM commun.

## Stack et architecture de référence

Le projet actuel utilise :

- Vite;
- React 18;
- TypeScript;
- Supabase Postgres;
- Supabase Auth;
- Supabase Storage;
- Supabase Edge Functions;
- une architecture par feature :
  `src/features/<nom>/{domain,application,infrastructure/supabase,presentation}`.

Le CRM doit respecter cette architecture existante.

## MVP CRM — inclus

### 1. Création d’un prospect

Un prospect doit pouvoir être créé de deux façons principales.

#### A. Création manuelle

Depuis le CRM, l’utilisateur peut cliquer sur :

`+ Ajouter un prospect`

Le formulaire minimal doit permettre de saisir :

- prénom;
- nom;
- entreprise;
- courriel;
- téléphone;
- source;
- valeur estimée;
- note initiale.

Le courriel et le téléphone ne sont pas obligatoires individuellement, mais au moins un moyen de contact doit idéalement être fourni lorsqu’un prospect réel est créé.

#### B. Formulaire provenant du site web

Un site relié à Signa peut transmettre une demande vers l’API publique des intégrations de sites.

La demande doit créer ou rattacher :

- un contact;
- une opportunité;
- une activité;
- les métadonnées de provenance.

Les formulaires web et la création manuelle doivent alimenter le même modèle CRM.

## 2. Coordonnées du prospect

Les fiches CRM doivent supporter au minimum :

- prénom;
- nom;
- nom complet affiché;
- entreprise;
- courriel;
- téléphone;
- source;
- sous-source ou formulaire d’origine;
- page d’origine;
- paramètres UTM utiles;
- statut/pipeline;
- valeur estimée;
- responsable;
- prochaine relance;
- date de création;
- dernière activité.

## 3. Sources de prospects

Les sources standards proposées sont :

- `website`;
- `phone`;
- `email`;
- `referral`;
- `facebook`;
- `instagram`;
- `google`;
- `door_to_door`;
- `import`;
- `other`.

L’interface peut afficher des libellés français, mais les clés enregistrées doivent rester stables.

Exemples :

- Site web;
- Téléphone;
- Courriel;
- Référence;
- Facebook;
- Instagram;
- Google;
- Porte-à-porte;
- Import;
- Autre.

## 4. Pipeline commercial

Le CRM doit conserver un pipeline configurable.

Pipeline par défaut recommandé :

1. Nouveau
2. À contacter
3. Contacté
4. Qualifié
5. Soumission
6. Négociation
7. Gagné
8. Perdu

Le projet possède déjà un pipeline réel et persistant. La nouvelle documentation ne remplace pas mécaniquement les étapes existantes : toute migration d’étapes doit préserver les données existantes.

Le pipeline doit être utilisable :

- en liste;
- en Kanban;
- sur mobile;
- avec changement d’étape;
- avec historique des changements importants.

## 5. Fiche prospect

La fiche prospect doit devenir le point central du suivi commercial.

Elle doit afficher :

- identité;
- entreprise;
- courriel;
- téléphone;
- source;
- valeur estimée;
- étape;
- responsable;
- prochaine action;
- notes;
- historique;
- tâches;
- opportunités liées lorsque pertinent.

## 6. Historique / timeline

Toute action importante doit pouvoir apparaître dans une chronologie.

Types d’événements visés :

- prospect créé manuellement;
- formulaire web reçu;
- note ajoutée;
- appel consigné;
- courriel consigné;
- changement d’étape;
- tâche créée;
- tâche terminée;
- responsable changé;
- opportunité gagnée;
- opportunité perdue;
- conversion en client.

Les activités déjà présentes dans le CRM servent de base à cette timeline.

## 7. Tâches et relances

Chaque prospect peut avoir une ou plusieurs tâches.

Exemples :

- appeler;
- envoyer un courriel;
- préparer une soumission;
- relancer;
- rendez-vous;
- autre.

Les vues CRM doivent permettre de voir :

- tâches à faire;
- tâches en retard;
- tâches terminées;
- prochaines relances.

L’assignation à un autre membre de l’équipe doit être ajoutée lorsque la gestion d’équipe CRM est activée.

## 8. Détection de doublons

Le MVP doit signaler les doublons potentiels avant de créer un nouveau contact.

La détection doit utiliser au minimum :

- courriel normalisé;
- téléphone normalisé.

Comportement attendu :

- aucun doublon trouvé : création normale;
- doublon potentiel trouvé : afficher le contact existant;
- création manuelle : permettre à l’utilisateur d’ouvrir le contact ou de créer quand même;
- soumission web : rattacher la nouvelle demande au contact existant lorsque la correspondance est suffisamment fiable, sans fusion destructive.

Aucune fusion automatique destructive de fiches n’est permise dans le MVP.

## 9. Prospect → Client

Un prospect gagné doit pouvoir devenir un client sans perdre son historique.

La conversion doit conserver :

- coordonnées;
- entreprise;
- source originale;
- activités;
- tâches;
- opportunités;
- valeur de la vente;
- date de conversion.

Le MVP peut représenter cette conversion par un statut/attribut du contact plutôt que par une duplication de données.

## 10. Attribution des prospects

Le CRM doit supporter un responsable commercial.

Minimum MVP :

- responsable optionnel;
- assignation manuelle;
- affichage du responsable sur la fiche.

Après validation du besoin :

- attribution automatique;
- règles par service;
- round-robin;
- règles par source.

## 11. Automatisations simples

Les automatisations complexes ne sont pas requises avant que les fonctions de base soient stables.

Premiers scénarios à prévoir :

- nouveau prospect web → créer activité;
- nouveau prospect web → créer tâche de suivi;
- nouveau prospect → assigner un responsable;
- opportunité gagnée → convertir en client;
- prospect sans activité depuis X jours → créer une relance.

## Non inclus immédiatement

À préparer architecturalement mais à ne pas prioriser avant le CRM de base :

- lead scoring avancé;
- séquences marketing;
- téléphonie complète;
- SMS bidirectionnels;
- synchronisation complète de boîte courriel;
- IA de vente;
- transcription d’appels;
- marketing automation complexe.

## Critères de sortie CRM

Le CRM est considéré prêt pour un pilote lorsqu’un utilisateur peut :

1. créer manuellement un prospect;
2. recevoir un prospect depuis un site;
3. voir son courriel et son téléphone;
4. connaître sa source;
5. détecter un doublon potentiel;
6. déplacer le prospect dans le pipeline;
7. consulter son historique;
8. ajouter une note;
9. créer une tâche ou relance;
10. assigner un responsable;
11. gagner/perdre l’opportunité;
12. convertir une vente gagnée en client;
13. retrouver les données après reconnexion;
14. utiliser les fonctions principales sur mobile;
15. ne jamais voir les données d’une autre organisation.
