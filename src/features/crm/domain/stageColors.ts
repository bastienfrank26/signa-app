// Les couleurs d'étape ne sont pas en base (le pipeline reste simple pour le
// MVP : voir 06-MODULE-CRM.md, "les étapes peuvent être renommées ou
// réordonnées" sans mention de couleur). Correspondance par clé standard,
// avec une couleur neutre par défaut pour une étape renommée/inconnue.
const COLORS: Record<string, string> = {
  nouveau: '#2B6CB0',
  a_contacter: '#B4740E',
  qualifie: '#6B46C1',
  proposition: '#E8521A',
  gagne: '#1F7A5C',
  perdu: '#8899AA',
};

export function stageColorByKey(key: string): string {
  return COLORS[key] ?? '#8899AA';
}
