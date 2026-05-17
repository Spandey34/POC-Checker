import { useState } from 'react';
import { BranchBadge } from '../common/Badge';
import ConfirmDialog from '../common/ConfirmDialog';
import { deletePOC } from '../../services/pocService';
import toast from 'react-hot-toast';

export default function POCTable({
  pocs,
  onEdit,
  onRefresh,
  showAddedBy = false,
  currentUser = null,
}) {
  const [deleting, setDeleting] =
    useState(null);

  const handleDelete = async () => {
    try {
      await deletePOC(
        deleting._id
      );

      toast.success(
        `"${deleting.name}" removed`
      );

      onRefresh();
    } catch {
      toast.error(
        'Failed to delete POC'
      );
    } finally {
      setDeleting(null);
    }
  };

  if (!pocs.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">
          📋
        </div>

        <p className="font-body text-sm">
          No POCs found. Add your
          first one!
        </p>
      </div>
    );
  }
  console.log(pocs[0].userId, currentUser?._id);

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
                poc.userId?.clerkId ===
                  currentUser?._id;
                  
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
                      Added{' '}
                      {new Date(
                        poc.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <BranchBadge
                      branch={poc.branch}
                    />
                  </td>

                  {showAddedBy && (
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-navy">
                          {poc.userId?.firstName ||
                            'N/A'}
                        </p>

                        <p className="text-xs text-slate-400">
                          {poc.userId
                            ?.email ||
                            'N/A'}
                        </p>
                      </div>
                    </td>
                  )}

                  <td className="px-4 py-3 hidden md:table-cell">
                    {poc.aliases?.length >
                    0 ? (
                      <div className="flex flex-wrap gap-1">
                        {poc.aliases.map(
                          (a) => (
                            <span
                              key={a}
                              className="tag bg-slate-100 text-slate-600 font-mono text-[11px]"
                            >
                              {a}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      {canModify ? (
                        <>
                          <button
                            onClick={() =>
                              onEdit(poc)
                            }
                            className="text-xs px-3 py-1.5 rounded-lg bg-navy/5 text-navy hover:bg-navy/10 font-medium transition-colors"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              setDeleting(poc)
                            }
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-300">
                          Not owner
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() =>
          setDeleting(null)
        }
        onConfirm={handleDelete}
        title="Remove POC"
        message={`Are you sure you want to remove "${deleting?.name}"? This cannot be undone.`}
        confirmLabel="Remove"
        danger
      />
    </>
  );
}