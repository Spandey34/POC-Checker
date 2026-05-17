import { useState } from 'react';
import { StatusBadge } from '../common/Badge';
import { toggleVerification } from '../../services/userService';
import toast from 'react-hot-toast';

const EMAIL_BRANCH_MAP = {
  cs: 'CSE',
  ec: 'ECE',
  ee: 'EE',
  ce: 'CIVIL',
  me: 'MECH',
  pi: 'PIE',
  mm: 'MME',
  cm: 'ECM',
};

function OnlineIndicator({
  lastVisit,
}) {
  if (!lastVisit)
    return (
      <span className="text-slate-300 text-xs">
        Never
      </span>
    );

  const diff =
    Date.now() -
    new Date(lastVisit).getTime();

  const mins = diff / 60000;

  const isOnline = mins < 5;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${
          isOnline
            ? 'bg-emerald-400 animate-pulse-dot'
            : 'bg-slate-300'
        }`}
      />

      <span className="text-xs text-slate-500">
        {isOnline
          ? 'Online'
          : new Date(
              lastVisit
            ).toLocaleString()}
      </span>
    </div>
  );
}

export default function UserTable({
  users,
  onRefresh,
  currentUser,
}) {
  const [toggling, setToggling] =
    useState(null);

  const currentUserCode =
    currentUser?.email
      ?.slice(6, 8)
      ?.toLowerCase();

  const currentUserBranch =
    EMAIL_BRANCH_MAP[
      currentUserCode
    ];

  const filteredUsers =
    users.filter((u) => {
      // Hide admins
      if (u.role === 'admin') {
        return false;
      }

      // Prevent self toggle
      if (
        u.email ===
        currentUser?.email
      ) {
        return false;
      }

      const code =
        u.email
          ?.slice(6, 8)
          ?.toLowerCase();

      const branch =
        EMAIL_BRANCH_MAP[
          code
        ];

      return (
        branch ===
        currentUserBranch
      );
    });

  const handleToggle = async (
    user
  ) => {
    setToggling(user._id);

    try {
      await toggleVerification(
        user._id
      );

      toast.success(
        user.isVerified
          ? `${user.firstName} revoked`
          : `${user.firstName} verified`
      );

      onRefresh();
    } catch {
      toast.error(
        'Failed to update status'
      );
    } finally {
      setToggling(null);
    }
  };

  if (!filteredUsers.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">
          👥
        </div>

        <p className="text-sm font-body">
          No users found for your
          branch.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-left">
            <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">
              User
            </th>

            <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">
              Status
            </th>

            <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider hidden md:table-cell">
              Last Active
            </th>

            <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider hidden md:table-cell">
              Joined
            </th>

            <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {filteredUsers.map((u) => (
            <tr
              key={u._id}
              className="hover:bg-slate-50/50 transition-colors group"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-navy font-display font-bold text-xs">
                      {
                        u.firstName?.[0]
                      }
                      {
                        u.lastName?.[0]
                      }
                    </span>
                  </div>

                  <div>
                    <p className="font-body font-semibold text-navy">
                      {u.firstName}{' '}
                      {u.lastName}
                    </p>

                    <p className="text-xs text-slate-400">
                      {u.email}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3">
                <StatusBadge
                  verified={
                    u.isVerified
                  }
                />
              </td>

              <td className="px-4 py-3 hidden md:table-cell">
                <OnlineIndicator
                  lastVisit={
                    u.lastVisit
                  }
                />
              </td>

              <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">
                {new Date(
                  u.createdAt
                ).toLocaleDateString()}
              </td>

              <td className="px-4 py-3">
                <button
                  onClick={() =>
                    handleToggle(u)
                  }
                  disabled={
                    toggling ===
                    u._id
                  }
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    u.isVerified
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {toggling ===
                  u._id
                    ? '…'
                    : u.isVerified
                    ? 'Revoke'
                    : 'Verify'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}