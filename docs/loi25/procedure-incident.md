# Procédure d'incident de confidentialité — Signa

> **BROUILLON DE TRAVAIL — INTERNE — À COMPLÉTER AVEC UN AVOCAT.** Voir `docs/loi25/README.md`. La Loi 25 impose des obligations précises de notification (à la Commission d'accès à l'information et aux personnes concernées) en cas d'incident présentant un risque de préjudice sérieux — les délais et critères exacts doivent être confirmés légalement.

_Dernière révision : 2026-09-12._

## Qu'est-ce qu'un incident de confidentialité

Tout accès non autorisé, utilisation, communication ou perte de renseignements personnels — par exemple : une faille de sécurité, une fuite entre organisations, un compte compromis, une clé de site volée, ou une erreur humaine exposant des données.

## Étapes

### 1. Détecter et confirmer

Quiconque (personnel Signa, client, alerte automatique) qui soupçonne un incident le signale immédiatement à [À COMPLÉTER — contact interne]. Ne pas attendre une confirmation complète pour signaler.

### 2. Contenir sans détruire les preuves

- Isoler la cause si possible (révoquer une clé compromise, suspendre un compte, corriger une faille) sans supprimer les journaux ou les preuves nécessaires à l'analyse.
- Exemple réel : en Phase 4 (2026-09-12), une faille a été trouvée en test (une fonction technique aurait permis à un utilisateur authentifié quelconque de créer des données dans n'importe quelle organisation). Elle a été corrigée le jour même, avant tout accès en production. Aucune donnée réelle n'a été affectée. Ce type de correction rapide, documentée, est le comportement attendu.

### 3. Évaluer l'ampleur

- Quelles catégories de données ? (voir `docs/loi25/registre-traitements.md`)
- Combien de personnes/organisations touchées ?
- Le préjudice potentiel est-il sérieux ? (identité, finances, réputation, discrimination)

### 4. Décider des obligations de notification

**À valider avec un avocat** : si le risque de préjudice sérieux est présent, la Loi 25 exige d'aviser la Commission d'accès à l'information du Québec et les personnes concernées, dans les meilleurs délais. Documenter la décision (avisée ou non, et pourquoi).

### 5. Communiquer

- Interne : informer l'équipe et la direction rapidement, avec les faits connus (pas de spéculation).
- Externe (si requis) : aviser les personnes/organisations touchées avec des instructions claires (ex. changer un mot de passe).

### 6. Corriger

Appliquer un correctif permanent (pas seulement un contournement temporaire), le vérifier, et le déployer.

### 7. Documenter et tirer des leçons

Pour chaque incident, consigner : ce qui s'est passé, quand, comment détecté, qui affecté, la correction appliquée, et ce qui aurait pu le prévenir. Mettre à jour cette procédure ou `docs/09-SECURITE-ET-LOI-25.md` si une lacune systémique est trouvée.

## Registre des incidents

| Date | Description | Portée | Notification requise ? | Correction |
| --- | --- | --- | --- | --- |
| 2026-09-12 | Fonction technique (`capture_site_submission_v1`) exécutable sans vérification par un utilisateur authentifié quelconque, trouvée par test interne pendant le développement (Phase 4) | Aucune donnée réelle affectée — trouvé et corrigé en test, avant usage en production | Non (aucune personne concernée, trouvé avant tout accès réel) | Révocation explicite des privilèges d'exécution par défaut (`revoke execute ... from anon, authenticated`), vérifiée par test d'intrusion |

Ajouter une ligne par incident réel, même mineur.
