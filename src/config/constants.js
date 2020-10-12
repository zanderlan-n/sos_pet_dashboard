export const PAGESIZE = 10;

export const MENTORSHIP_MAX_DURATION = 24;

export const mappedServiceNames = {
  Mentorship: 'Impulso Coletivo',
  Consultancy: 'Impulso Individual',
  Community: 'Comunidade',
};

export const mappedMettingStatus = {
  Opened: 'Aberto',
  Cancelled: 'Cancelado',
  Live: 'Live',
  Finished: 'Finalizado',
};

export const weekDays = [
  { label: 'Segunda-Feira', id: 'segunda' },
  { label: 'Terça-Feira', id: 'terca' },
  { label: 'Quarta-Feira', id: 'quarta' },
  { label: 'Quinta-Feira', id: 'quinta' },
  { label: 'Sexta-Feira', id: 'sexta' },
  { label: 'Sábado', id: 'sabado' },
  { label: 'Domingo', id: 'domingo' },
];

export const ServicesTypes = {
  mentorship: 'Mentorship',
  consultancy: 'Consultancy',
  community: 'Community',
};

export const MeetingStatus = {
  OPENED: 'Opened',
  CANCELLED: 'Cancelled',
  LIVE: 'Live',
  FINISHED: 'Finished',
};

export const updatableMeetingStatus = [
  MeetingStatus.OPENED,
  MeetingStatus.FINISHED,
];

export const filteredSubscriptionStatus = [
  'Cancelled',
  'Created',
  'Approved',
  'Rejected',
  'Paid',
  'Archived',
];
