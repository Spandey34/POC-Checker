import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { BRANCHES } from '../../config/constants';
import { addPOC, updatePOC } from '../../services/pocService';
import toast from 'react-hot-toast';

const empty = { name: '', aliases: '', branches: [] };

export default function POCForm({ isOpen, onClose, onSuccess, editing = null }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        name:     editing.name,
        aliases:  editing.aliases.join(', '),
        branches: editing.branches,
      });
    } else {
      setForm(empty);
    }
  }, [editing, isOpen]);

  const toggleBranch = (b) =>
    setForm((f) => ({
      ...f,
      branches: f.branches.includes(b) ? f.branches.filter((x) => x !== b) : [...f.branches, b],
    }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Company name is required');
    if (form.branches.length === 0) return toast.error('Select at least one branch');

    const payload = {
      name:     form.name.trim(),
      aliases:  form.aliases.split(',').map((a) => a.trim()).filter(Boolean),
      branches: form.branches,
    };

    setSaving(true);
    try {
      if (editing) {
        await updatePOC(editing._id, payload);
        toast.success('POC updated');
      } else {
        await addPOC(payload);
        toast.success('POC added');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit POC' : 'Add New POC'}>
      <div className="space-y-4">
        {/* Company Name */}
        <div>
          <label className="label">Company Name *</label>
          <input
            className="input"
            placeholder="e.g. MakeMyTrip"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* Aliases */}
        <div>
          <label className="label">Aliases / Shortcuts</label>
          <input
            className="input"
            placeholder="e.g. mmt, make my trip (comma-separated)"
            value={form.aliases}
            onChange={(e) => setForm((f) => ({ ...f, aliases: e.target.value }))}
          />
          <p className="text-xs text-slate-400 mt-1">Admin-only shortcuts for faster search</p>
        </div>

        {/* Branches */}
        <div>
          <label className="label">Branches *</label>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBranch(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  form.branches.includes(b)
                    ? 'bg-navy text-white border-navy shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-navy/40'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 justify-end">
          <button onClick={onClose} className="btn-ghost text-sm py-2 px-4" disabled={saving}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary text-sm py-2 px-4" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Update POC' : 'Add POC'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
