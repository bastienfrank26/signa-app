import type { Screen } from './types';

export interface NavItem {
  label: string;
  screen: Screen;
  badgeKey?: 'newProspects' | 'tasksLeft';
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Source unique de la navigation applicative : Sidebar (bureau), barre d'onglets
 * et feuille « Plus » (mobile) lisent tous cette liste — aucune duplication d'écrans.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'MON SITE',
    items: [
      { label: 'Accueil', screen: 'accueil' },
      { label: 'Suivi du projet', screen: 'projet' },
      { label: 'Fichiers', screen: 'fichiers' },
    ],
  },
  {
    label: 'CRM',
    items: [
      { label: 'Prospects', screen: 'prospects', badgeKey: 'newProspects' },
      { label: 'Pipeline', screen: 'pipeline' },
      { label: 'Contacts', screen: 'contacts' },
      { label: 'Tâches', screen: 'taches', badgeKey: 'tasksLeft' },
    ],
  },
];

/** Onglets visibles en permanence dans la barre mobile ; le reste vit dans la feuille « Plus ». */
export const MOBILE_PRIMARY_SCREENS: Screen[] = ['accueil', 'prospects', 'pipeline'];

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
