import { useState, useRef, useCallback, useEffect } from 'react';
import { StatusBadge } from '../common/Badge';
import { toggleVerification, getAllUsers, deleteUser } from '../../services/userService';
import ConfirmDialog from '../common/ConfirmDialog';
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

function OnlineIndicator({ lastVisit }) {
  if (!lastVisit) return <span className="text-slate-300 text-xs whitespace-nowrap">Never</span>;

  const diff = Date.now() - new Date(lastVisit).getTime();
  const mins = diff / 60000;
  const isOnline = mins < 5;
  const timeString = new Date(lastVisit).toLocaleString();

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isOnline ? 'bg-emerald-400 animate-pulse-dot' : 'bg-slate-300'
        }`}
      />
      <span 
        className="text-xs text-slate-500 truncate" 
        title={isOnline ? 'Online' : timeString}
      >
        {isOnline ? 'Online' : timeString}
      </span>
    </div>
  );
}

export default function UserTable({
  users,
  setUsers,
  userCursor,
  setUserCursor,
  currentUser,
}) {
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch logic encapsulated inside the table component
  const fetchUsers = useCallback(async (cursor = null) => {
    try {
      if (!cursor) setLoading(true);
      else setLoadingMore(true);

      const response = await getAllUsers(cursor, 20);

      if (cursor) {
        setUsers((prev) => [...prev, ...response.data]);
      } else {
        setUsers(response.data);
      }
      setUserCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [setUsers, setUserCursor]);

  // Initial load when the component mounts if we don't have data yet
  useEffect(() => {
    if (users.length === 0) {
      fetchUsers(null);
    }
  }, [users.length, fetchUsers]);

  // IntersectionObserver for infinite scrolling
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && userCursor) {
          fetchUsers(userCursor);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, userCursor, fetchUsers]
  );

  const currentUserCode = currentUser?.primaryEmailAddress?.emailAddress
    ?.slice(6, 8)
    ?.toLowerCase();

  const currentUserBranch = EMAIL_BRANCH_MAP[currentUserCode];

  const filteredUsers = users.filter((u) => {
    if (u.role === 'admin') return false;
    if (u.email === currentUser?.email) return false;

    const code = u.email?.slice(6, 8)?.toLowerCase();
    const branch = EMAIL_BRANCH_MAP[code];

    return branch === currentUserBranch;
  });

  const requireToggleConfirmation = (user) => {
    setConfirmAction({
      type: user.isVerified ? 'revoke' : 'verify',
      user,
    });
  };

  const requireDeleteConfirmation = (user) => {
    setConfirmAction({
      type: 'delete',
      user,
    });
  };

  const handleExecuteConfirmedAction = async () => {
    if (!confirmAction) return;

    const { type, user } = confirmAction;
    setConfirmAction(null); 

    if (type === 'verify' || type === 'revoke') {
      setToggling(user._id);
      try {
        await toggleVerification(user._id);
        toast.success(
          type === 'revoke' ? `${user.firstName} revoked` : `${user.firstName} verified`
        );
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isVerified: !u.isVerified } : u))
        );
      } catch {
        toast.error('Failed to update status');
      } finally {
        setToggling(null);
      }
    }

    if (type === 'delete') {
      setDeleting(user._id);
      try {
        await deleteUser(user._id);
        toast.success(`${user.firstName} has been deleted`);
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
      } catch {
        toast.error('Failed to delete user');
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="font-body text-sm animate-pulse">Loading users...</p>
      </div>
    );
  }

  if (!filteredUsers.length && !loadingMore) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">👥</div>
        <p className="text-sm font-body">No users found for your branch.</p>
      </div>
    );
  }

  const modalConfig = {
    title: confirmAction?.type === 'delete' ? 'Delete User' : confirmAction?.type === 'revoke' ? 'Revoke Verification' : 'Verify IC',
    message: confirmAction?.type === 'delete' 
      ? `Are you sure you want to completely remove ${confirmAction?.user?.firstName} ${confirmAction?.user?.lastName}? This action cannot be undone.`
      : confirmAction?.type === 'revoke'
      ? `Are you sure you want to remove portal access for ${confirmAction?.user?.firstName}?`
      : `Allow portal access to ${confirmAction?.user?.firstName}?`,
    confirmLabel: confirmAction?.type === 'delete' ? 'Delete' : confirmAction?.type === 'revoke' ? 'Revoke' : 'Verify',
    danger: confirmAction?.type === 'delete' || confirmAction?.type === 'revoke',
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          {/* 🚀 THE FIX: Changed min-w-[800px] to min-w-[600px] on mobile to maintain solid row background colors */}
          <table className="w-full text-sm table-fixed min-w-[600px] md:min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                {/* Adjusted column layouts proportionally to maximize mobile real estate */}
                <th className="w-[35%] md:w-[35%] px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">User</th>
                <th className="w-[15%] md:w-[15%] px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">Status</th>
                <th className="w-[25%] md:w-[20%] px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">Last Active</th>
                <th className="md:w-[10%] px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="w-[25%] md:w-[20%] px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                const isProcessing = toggling === u._id || deleting === u._id;
                
                return (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-navy font-display font-bold text-xs">
                            {u.firstName?.[0] || ''}
                            {u.lastName?.[0] || ''}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-body font-semibold text-navy truncate" title={fullName}>
                            {fullName || 'Unknown User'}
                          </p>
                          <p className="text-xs text-slate-400 truncate" title={u.email}>
                            {u.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge verified={u.isVerified} />
                    </td>

                    <td className="px-4 py-3">
                      <OnlineIndicator lastVisit={u.lastVisit} />
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500 whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => requireToggleConfirmation(u)}
                          disabled={isProcessing}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap ${
                            u.isVerified
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {toggling === u._id ? '…' : u.isVerified ? 'Revoke' : 'Verify'}
                        </button>

                        {!u.isVerified && (
                          <button
                            onClick={() => requireDeleteConfirmation(u)}
                            disabled={isProcessing}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {deleting === u._id ? '…' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {userCursor && (
          <div ref={lastElementRef} className="flex justify-center py-6">
            <div className="flex items-center space-x-2 text-slate-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-body text-sm font-medium animate-pulse">Loading more users...</span>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleExecuteConfirmedAction}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        danger={modalConfig.danger}
      />
    </>
  );
}