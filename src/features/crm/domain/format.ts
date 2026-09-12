export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return `il y a ${days} jour${days > 1 ? 's' : ''}`;
}

export function formatNextFollowUp(dateStr: string | null): string {
  if (!dateStr) return '—';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return 'Aujourd’hui';
  if (diffDays === 1) return 'Demain';
  if (diffDays < 0) return `En retard · ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
  return target.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
}
