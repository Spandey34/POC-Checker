export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const ALLOWED_DOMAIN = import.meta.env.VITE_ALLOWED_DOMAIN || 'nitjsr.ac.in';
export const BRANCHES = ['CSE', 'ECE', 'MME', 'ECM', 'PIE', 'Mech', 'Civil'];

export const BRANCH_COLORS = {
  CSE:   'bg-blue-100 text-blue-800',
  ECE:   'bg-purple-100 text-purple-800',
  MME:   'bg-orange-100 text-orange-800',
  ECM:   'bg-teal-100 text-teal-800',
  PIE:   'bg-pink-100 text-pink-800',
  Mech:  'bg-yellow-100 text-yellow-800',
  Civil: 'bg-green-100 text-green-800',
};
