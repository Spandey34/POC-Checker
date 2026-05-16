import { BRANCH_COLORS } from '../../config/constants';

export function BranchBadge({ branch }) {
  const cls = BRANCH_COLORS[branch] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`tag font-medium ${cls}`}>{branch}</span>
  );
}

export function StatusBadge({ verified }) {
  return verified ? (
    <span className="tag bg-emerald-100 text-emerald-700 font-semibold">✓ Verified</span>
  ) : (
    <span className="tag bg-amber-100 text-amber-700 font-semibold">⏳ Pending</span>
  );
}

export function RoleBadge({ role }) {
  return role === 'admin' ? (
    <span className="tag bg-navy/10 text-navy font-semibold">Admin</span>
  ) : (
    <span className="tag bg-slate-100 text-slate-700">User</span>
  );
}
