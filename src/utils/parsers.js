export const MinutesToHours = (totalMinutes, format = 'short') => {
  const hours = totalMinutes / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  const formattedHours = `${rhours}`.padStart(2, '0');
  const formattedMinutes = `${rminutes}`.padStart(2, '0');
  if (format === 'short') {
    if (!rhours) {
      return `${formattedMinutes}m`;
    }
    return `${formattedHours}:${formattedMinutes}h`;
  }
  const formatted = [];
  if (rhours === 1) formatted.push('1 hora');
  else if (rhours > 0) formatted.push(`${rhours} horas`);
  if (rminutes > 0) {
    formatted.push(`${rminutes} minutos`);
  }
  return `${formatted.join(' e ')}`;
};

export const getOnlyNumbers = (value) => {
  return value ? value.replace(/[^\d]/g, '') : '';
}