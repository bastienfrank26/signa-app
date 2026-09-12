# Portail client

## Rôle

Le portail est le premier accès après le paiement. Il remplace les échanges dispersés et montre clairement ce que Signa attend, construit et exploite.

## Parcours officiel

| Étape | Action client | Action Signa | Sortie |
| --- | --- | --- | --- |
| Paiement reçu | Ouvre son accès | Crée le compte et le projet | Organisation active |
| Informations | Remplit son profil | Vérifie les éléments | Brief complet |
| Fichiers | Envoie logo, photos et textes | Classe et valide | Contenu utilisable |
| Création | Consulte la progression | Fabrique le site | Version prête |
| Version privée | Explore le site | Fournit le lien protégé | Révision ouverte |
| Corrections | Soumet des demandes | Traite et répond | Liste résolue |
| Approbation | Approuve officiellement | Verrouille la version | Autorisation datée |
| Mise en ligne | Reçoit la confirmation | Publie et configure | Site actif |

> Note (2026-09-12) : la création automatique du compte à la création d'une organisation (via inscription libre, Phase 0) remplace temporairement « Signa crée le compte et le projet ». Le vrai déclenchement par paiement (Stripe) existe depuis la Phase 5, mais la création d'organisation reste self-service — voir `memory/tasks.md`.

## États

`awaiting_information`, `content_review`, `in_production`, `private_review`, `revisions`, `approved`, `launching`, `live`, `maintenance`.

Chaque transition est effectuée côté serveur, datée et attribuée.

## Tableau de bord

- étape courante et prochaine action;
- éléments manquants;
- échéancier indicatif;
- dernières activités;
- accès au module activé;
- services actifs après la mise en ligne.

## Fichiers

Les formats et limites sont explicites. Les téléversements utilisent des URL signées, une validation de type et une analyse de sécurité. Les accès sont limités aux personnes autorisées.

## Corrections

Une demande contient page ou URL, description, priorité, pièces jointes et état. États : `submitted`, `acknowledged`, `in_progress`, `ready_for_review`, `resolved`, `declined`.

## Approbation

Elle affiche la version et les conséquences, puis conserve utilisateur, heure, version et texte de consentement.

## Notifications

- accès créé;
- information ou fichier manquant;
- version privée prête;
- réponse à une correction;
- approbation demandée;
- site mis en ligne.

> Note (2026-09-12) : aucune table `notifications` ni envoi de courriel n'existe encore — une activité CRM sert d'équivalent visible dans l'interface pour l'instant.

## Critères d'acceptation

- parcours complet sur téléphone;
- prochaine action toujours évidente;
- accès privés révocables;
- fichiers et projets isolés;
- approbation traçable;
- aucun faux bouton ou état uniquement visuel.
