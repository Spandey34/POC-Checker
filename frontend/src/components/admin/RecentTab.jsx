import { useEffect, useState, useRef, useCallback } from 'react';
import { BRANCH_MAPPINGS } from '../../config/constants';
import { getRecentActivities } from '../../services/recentService';
import { useCount } from '../../context/CountContext';

function getBranchFromEmail(email = '') {
  if (!email) return 'N/A';

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

export default function RecentTab({recentItems, setRecentItems, nextCursor, setNextCursor}) {
  const { recentCount, setRecentCount } = useCount();
  const [loading, setLoading] = useState(recentItems.length===0);
  const [loadingMore, setLoadingMore] = useState(false);
  // Reference for the IntersectionObserver to watch
  const observer = useRef();

  const fetchActivities = async (cursor = null) => {
    try {
      if (!cursor) setLoading(true);
      else setLoadingMore(true);

      const response = await getRecentActivities(cursor, 20);
      
      if (cursor) {
        setRecentItems((prev) => [...prev, ...response.data]);
      } else {
        setRecentItems(response.data);
      }

      setRecentCount((prevCount) => prevCount + response.data.length);
      
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    if(nextCursor!==null)fetchActivities(nextCursor);
    else if(recentItems.length === 0) fetchActivities();
  }, []);
  
  

  // Set up the IntersectionObserver to trigger loading when the bottom is reached
  const lastElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && nextCursor) {
          fetchActivities(nextCursor);
        }
      });
      
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, nextCursor]
  );

  if (loading) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="font-body text-sm animate-pulse">Loading activities...</p>
      </div>
    );
  }

  if (!recentItems.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">🕒</div>
        <p className="font-body text-sm">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
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

      {/* Invisible loader element that triggers the next fetch when scrolled into view */}
      {nextCursor && (
        <div ref={lastElementRef} className="flex justify-center py-6">
          <div className="flex items-center space-x-2 text-slate-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-body text-sm font-medium animate-pulse">Loading more activities...</span>
          </div>
        </div>
      )}
    </div>
  );
}
