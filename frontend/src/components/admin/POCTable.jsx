import { useState, useEffect, useRef, useCallback } from 'react';
import { BranchBadge } from '../common/Badge';
import ConfirmDialog from '../common/ConfirmDialog';
import { deletePOC, getAllPOCs } from '../../services/pocService';
import toast from 'react-hot-toast';
import { BRANCH_MAPPINGS } from '../../config/constants';

function normalizePOC(poc = {}) {
  return {
    ...poc,
    name: poc.name || poc.companyName || poc.company || "N/A",
    createdAt:
      poc.createdAt ||
      poc.addedAt ||
      poc.dateCreated ||
      poc.updatedAt ||
      new Date().toISOString(),
    branch: poc.branch || "",
    aliases: Array.isArray(poc.aliases) ? poc.aliases : [],
    userId: poc.userId || poc.addedBy || null,
  };
}

export default function POCTable({
  pocs,
  setPocs,
  pocCursor,
  setPocCursor,
  branch,
  onEdit,
  showAddedBy = false,
  currentUser = null,
}) {
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPOCs = useCallback(
    async (currentCursor = 0, isReset = false) => {
      try {
        if (isReset) setLoading(true);
        else setLoadingMore(true);

        const response = await getAllPOCs(branch, currentCursor, 20);

        if (isReset) {
          setPocs((response.data || []).map(normalizePOC));
        } else {
          setPocs((prev) => [...prev, ...(response.data || []).map(normalizePOC)]);
        }

        setPocCursor(response.nextCursor);
      } catch (error) {
        console.error('Failed to fetch POCs:', error);
        toast.error('Failed to load POCs');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [branch, setPocs, setPocCursor]
  );

  // Trigger reset and fetch when branch changes
  useEffect(() => {
    if (pocs.length === 0) {
      setPocs([]);
      setPocCursor(0);
      fetchPOCs(0, true);
    }
  }, [branch]);

  // IntersectionObserver for infinite scrolling
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pocCursor !== null) {
          fetchPOCs(pocCursor, false);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, pocCursor, fetchPOCs]
  );

  const handleDelete = async () => {
    try {
      await deletePOC(deleting._id);
      toast.success(`"${deleting.name}" removed`);
      // Optimistic delete
      setPocs((prev) => prev.filter((p) => p._id !== deleting._id));
    } catch {
      toast.error('Failed to delete POC');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="font-body text-sm animate-pulse">Loading POCs...</p>
      </div>
    );
  }

  if (!pocs.length && !loadingMore) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">📋</div>
        <p className="font-body text-sm">No POCs found. Add your first one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">
                Branch
              </th>
              {showAddedBy && (
                <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">
                  Added By
                </th>
              )}
              <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider hidden md:table-cell">
                Aliases
              </th>
              <th className="px-4 py-3 font-display font-semibold text-navy text-xs uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pocs.map((poc) => {
              const canModify =
                poc.branch ===
                BRANCH_MAPPINGS[
                  currentUser.primaryEmailAddress.emailAddress.slice(6, 8)
                ];
              return (
                <tr
                  key={poc._id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <p className="font-body font-semibold text-navy">
                      {poc.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Added {new Date(poc.createdAt).toLocaleDateString()}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <BranchBadge branch={poc.branch} />
                  </td>

                  {showAddedBy && (
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-navy">
                          {poc.userId?.firstName || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {poc.userId?.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                  )}

                  <td className="px-4 py-3 hidden md:table-cell">
                    {poc.aliases?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {poc.aliases.map((a) => (
                          <span
                            key={a}
                            className="tag bg-slate-100 text-slate-600 font-mono text-[11px]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      {canModify ? (
                        <>
                          <button
                            onClick={() => onEdit(poc)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-navy/5 text-navy hover:bg-navy/10 font-medium transition-colors"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => setDeleting(poc)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-300">Not owner</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pocCursor !== null && (
        <div ref={lastElementRef} className="flex justify-center py-6">
          <div className="flex items-center space-x-2 text-slate-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-body text-sm font-medium animate-pulse">Loading more...</span>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Remove POC"
        message={`Are you sure you want to remove "${deleting?.name}"? This cannot be undone.`}
        confirmLabel="Remove"
        danger
      />
    </>
  );
}