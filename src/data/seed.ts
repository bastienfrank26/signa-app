import type { ActivityItem, Prospect, Stage, Task } from '../types';

export interface StageInfo {
  key: Stage;
  color: string;
}

export const STAGES: StageInfo[] = [
  { key: 'Nouveau', color: '#2B6CB0' },
  { key: 'À contacter', color: '#B4740E' },
  { key: 'Qualifié', color: '#6B46C1' },
  { key: 'Proposition', color: '#E8521A' },
  { key: 'Gagné', color: '#1F7A5C' },
  { key: 'Perdu', color: '#8899AA' },
];

export const AVATAR_COLORS = ['#0F1B2D', '#E8521A', '#2B6CB0', '#1F7A5C', '#6B46C1', '#B4740E'];

export const SEED_PROSPECTS: Prospect[] = [
  { id: 1, name: 'Marie Tremblay', company: 'Particulier', sub: 'Rénovation résidentielle', value: 2500, stage: 'Nouveau', source: 'Formulaire du site', email: 'marie.tremblay@courriel.ca', phone: '(418) 555-0142', next: 'Aujourd’hui' },
  { id: 2, name: 'Plomberie Mercier', company: 'Plomberie Mercier inc.', sub: 'Site web vitrine', value: 1200, stage: 'Nouveau', source: 'Téléphone', email: 'info@plomberiemercier.ca', phone: '(450) 555-0198', next: 'Demain' },
  { id: 3, name: 'Clinique Santé Plus', company: 'Santé Plus', sub: 'Refonte du site', value: 3700, stage: 'Nouveau', source: 'Formulaire du site', email: 'direction@santeplus.ca', phone: '(514) 555-0177', next: '26 sept.' },
  { id: 4, name: 'Construction Lavoie', company: 'Lavoie & Fils', sub: 'Soumission en cours', value: 4200, stage: 'À contacter', source: 'Référence', email: 'martin@lavoiefils.ca', phone: '(819) 555-0121', next: 'Aujourd’hui' },
  { id: 5, name: 'Atelier Bois & Cie', company: 'Atelier Bois', sub: 'Discussion initiale', value: 2100, stage: 'À contacter', source: 'Formulaire du site', email: 'contact@atelierbois.ca', phone: '(418) 555-0165', next: '27 sept.' },
  { id: 6, name: 'Julie Dubois', company: 'Dubois Design', sub: 'Image de marque', value: 1800, stage: 'Qualifié', source: 'Téléphone', email: 'julie@duboisdesign.ca', phone: '(514) 555-0110', next: 'En retard · 7 jours' },
  { id: 7, name: 'Les Jardins du Lac', company: 'Jardins du Lac', sub: 'Soumission envoyée', value: 4800, stage: 'Proposition', source: 'Formulaire du site', email: 'info@jardinsdulac.ca', phone: '(450) 555-0133', next: '29 sept.' },
  { id: 8, name: 'Garage Dubois', company: 'Garage Dubois', sub: 'Nouveau site', value: 8900, stage: 'Gagné', source: 'Référence', email: 'garage@dubois.ca', phone: '(819) 555-0187', next: '—' },
  { id: 9, name: 'Centre Yoga Vie', company: 'Yoga Vie', sub: 'Refonte + SEO', value: 3600, stage: 'Gagné', source: 'Formulaire du site', email: 'allo@yogavie.ca', phone: '(514) 555-0156', next: '—' },
  { id: 10, name: 'Dépanneur Beaulieu', company: 'Beaulieu inc.', sub: 'Petit site', value: 900, stage: 'Perdu', source: 'Formulaire du site', email: 'beaulieu@dep.ca', phone: '(418) 555-0102', next: '—' },
];

export const SEED_TASKS: Task[] = [
  { id: 1, label: 'Rappeler Marc Bouchard', sub: 'Discussion sur la soumission', due: 'Aujourd’hui', urgent: true, done: false },
  { id: 2, label: 'Envoyer la soumission à Construction Lavoie', sub: 'Suivi par courriel', due: 'Aujourd’hui', urgent: true, done: false },
  { id: 3, label: 'Approuver la page À propos', sub: 'Dernières modifications prêtes', due: 'Demain', urgent: false, done: false },
  { id: 4, label: 'Relancer Julie Dubois', sub: 'Aucun retour depuis 7 jours', due: '26 sept.', urgent: false, done: false },
];

export const SEED_ACTIVITY: ActivityItem[] = [
  { title: 'Nouveau prospect', sub: 'Marie Tremblay a rempli le formulaire', time: 'il y a 12 min', color: '#2B6CB0' },
  { title: 'Mise à jour du projet', sub: 'La page Services a été finalisée', time: 'il y a 2 h', color: '#1F7A5C' },
  { title: 'Nouveau message', sub: 'Réponse de l’équipe Signa', time: 'il y a 3 h', color: '#E8521A' },
  { title: 'Facture disponible', sub: 'Votre facture de septembre est prête', time: 'il y a 1 jour', color: '#8899AA' },
];
