export type Stage =
  | 'Nouveau'
  | 'À contacter'
  | 'Qualifié'
  | 'Proposition'
  | 'Gagné'
  | 'Perdu';

export interface Prospect {
  id: number;
  name: string;
  company: string;
  sub: string;
  value: number;
  stage: Stage;
  source: string;
  email: string;
  phone: string;
  next: string;
}

export interface Task {
  id: number;
  label: string;
  sub: string;
  due: string;
  urgent: boolean;
  done: boolean;
}

export interface ActivityItem {
  title: string;
  sub: string;
  time: string;
  color: string;
}

export interface HistoryEntry {
  text: string;
  time: string;
}

export type Screen =
  | 'accueil'
  | 'prospects'
  | 'pipeline'
  | 'projet'
  | 'fichiers'
  | 'contacts'
  | 'taches';

export type Variant = 'A' | 'B';
export type Device = 'desktop' | 'mobile';
export type MobileTab = 'home' | 'pipe';
