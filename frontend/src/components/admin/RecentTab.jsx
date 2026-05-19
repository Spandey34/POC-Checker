import { useEffect, useState } from 'react';
import { BRANCH_MAPPINGS } from '../../config/constants';
import { getRecentActivities } from '../../services/recentService';

function getBranchFromEmail(email = '') {
  if (!email) return 'N/A';

  // Same idea as your POCTable: derive branch from email pattern
  const code = email.slice(6, 8);
  return (
    BRANCH_MAPPINGS[code] ||
    BRANCH_MAPPINGS[code.toUpperCase()] ||
    BRANCH_MAPPINGS[code.toLowerCase()] ||
    'N/A'
  );
}

function getActionBadgeClass(actionType) {
  switch (actionType) {
    case 'Added':
      return 'bg-emerald-50 text-emerald-700';
    case 'Deleted':
      return 'bg-red-50 text-red-700';
    case 'Updated':
      return 'bg-blue-50 text-blue-700';
    case 'Transferred':
      return 'bg-amber-50 text-amber-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export default function RecentTab(recentItems) {

  if (!recentItems.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">🕒</div>
        <p className="font-body text-sm">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-left">
            <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">
              Company
            </th>
            <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">
              Action
            </th>
            <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">
              Action By
            </th>
            <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider text-right">
              Time
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {recentItems.map((item) => {
            const user = item.actionBy || {};
            const userBranch = getBranchFromEmail(user.email);

            const transferLabel =
              item.actionType === 'Transferred'
                ? `${userBranch} → ${item.POCBranch || 'Current Branch'}`
                : item.POCBranch;

            return (
              <tr
                key={item._id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-body font-semibold text-navy">
                    {item.POCName || 'N/A'}
                  </p>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getActionBadgeClass(
                      item.actionType
                    )}`}
                  >
                    {item.actionType || 'N/A'}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-navy">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : 'N/A'}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.actionType === 'Transferred'
                        ? `Branch: ${transferLabel}`
                        : `Branch: ${userBranch}`}
                    </p>

                    <p className="text-xs text-slate-400">
                      {user.email || 'N/A'}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-3 text-right">
                  <p className="text-xs text-slate-500">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}