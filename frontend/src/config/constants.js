export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const ALLOWED_DOMAIN = import.meta.env.VITE_ALLOWED_DOMAIN || 'nitjsr.ac.in';
export const BRANCHES = ['CSE', 'CIVIL', 'ECE', 'EE', 'ECM', 'MME', 'PIE', 'MECH'];

export const BRANCH_COLORS = {
  CSE:   'bg-blue-100 text-blue-800',
  CIVIL: 'bg-green-100 text-green-800',
  ECE:   'bg-purple-100 text-purple-800',
  EE:    'bg-cyan-300 text-cyan-800',
  ECM:   'bg-teal-100 text-teal-800',
  MME:   'bg-orange-100 text-orange-800',
  PIE:   'bg-pink-100 text-pink-800',
  MECH:  'bg-yellow-100 text-yellow-800',
};
