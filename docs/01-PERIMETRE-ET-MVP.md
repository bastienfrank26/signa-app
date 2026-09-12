# Périmètre et MVP

## Définition

Le MVP vendable accompagne un client réel de son paiement jusqu'à l'utilisation quotidienne de son CRM, tout en permettant à Signa de l'administrer sans intervention directe dans la base de données.

## Inclus

### Portail client

- accès sécurisé et appartenance à une organisation;
- progression du projet web;
- collecte des informations d'entreprise;
- dépôt et consultation de fichiers;
- présentation d'une version privée;
- demandes de corrections;
- approbation et confirmation de mise en ligne.

### CRM principal

- contacts et entreprises;
- pipeline configurable;
- valeur, source, notes et prochain suivi;
- activités, tâches, rappels et assignation;
- réception des formulaires du site;
- recherche, filtres et export CSV.

### Administration Signa

- créer et consulter une organisation;
- inviter ou suspendre un utilisateur;
- attribuer un forfait et un module;
- suivre les projets web;
- générer et révoquer une clé de site;
- consulter un journal d'audit.

### Exploitation

- abonnement Stripe synchronisé par webhooks;
- courriels transactionnels essentiels;
- sauvegardes, journaux et alertes;
- export et suppression contrôlés des données.

## Non inclus au MVP

- constructeur de sites web;
- application mobile native;
- automatisations marketing complexes;
- téléphonie, comptabilité ou paie complètes;
- place de marché de modules;
- personnalisation sans limites du CRM;
- modules Rendez-vous et Appels de service terminés.

Ces modules sont préparés architecturalement, puis construits après la validation du noyau et du CRM.

## Critères de sortie

- Tous les accès sont contrôlés côté serveur.
- L'isolation multi-organisation est testée.
- Le parcours portail fonctionne sur mobile et bureau.
- Une soumission du site arrive dans le bon compte.
- Signa peut activer, suspendre et rétablir un compte.
- La facturation résiste aux webhooks répétés ou désordonnés.
- Les sauvegardes et la restauration sont testées.
- Les textes juridiques et procédures Loi 25 sont prêts.
- Les données de démonstration sont absentes des comptes réels.
- Trois à cinq entreprises pilotes complètent un scénario réel.

## Garde-fou

Toute demande doit servir le MVP, plusieurs métiers ou un revenu validé. Sinon, elle entre dans la feuille de route.
