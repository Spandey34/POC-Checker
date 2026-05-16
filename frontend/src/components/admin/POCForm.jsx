import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { API_URL, BRANCHES } from "../../config/constants";
import { addPOC, updatePOC } from "../../services/pocService";
import toast from "react-hot-toast";

const empty = {
  name: "",
  aliases: "",
  branch: "",
};

const generateAcronym = (name) => {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export default function POCForm({
  isOpen,
  onClose,
  onSuccess,
  editing = null,
}) {
  const [form, setForm] = useState(empty);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        aliases: editing.aliases.join(", "),
        branch: editing.branch,
      });
    } else {
      setForm(empty);
    }
  }, [editing, isOpen]);

  const acronym =
    form.name.trim().split(" ").length > 1
      ? generateAcronym(form.name)
      : "";

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      return toast.error("Company name is required");
    }

    if (!form.branch) {
      return toast.error("Select a branch");
    }

    const payload = {
      name: form.name.trim(),

      aliases: form.aliases
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),

      branch: form.branch,
    };

    setSaving(true);

    try {
      if (editing) {
        console.log("Editing Id: ", editing._id);
        await updatePOC(editing._id, payload);

        toast.success("POC updated");
      } else {
        await addPOC(payload);

        toast.success("POC added");
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editing
          ? "Edit POC"
          : "Add New POC"
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">
            Company Name *
          </label>

          <input
            className="input"
            placeholder="e.g. Texas Instruments"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                name: e.target.value,
              }))
            }
          />

          {acronym && (
            <p className="text-xs text-slate-500 mt-1">
              Generated acronym:
              <span className="font-semibold ml-1">
                {acronym}
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="label">
            Custom Aliases (Optional)
          </label>

          <input
            className="input"
            placeholder="e.g. facebook, google"
            value={form.aliases}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                aliases: e.target.value,
              }))
            }
          />

          <p className="text-xs text-slate-400 mt-1">
            Acronyms are generated automatically
          </p>
        </div>

        <div>
          <label className="label">
            Branch *
          </label>

          <select
            className="input"
            value={form.branch}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                branch: e.target.value,
              }))
            }
          >
            <option value="">
              Select branch
            </option>

            {BRANCHES.map((b) => (
              <option
                key={b}
                value={b}
              >
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2 justify-end">
          <button
            onClick={onClose}
            className="btn-ghost text-sm py-2 px-4"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="btn-primary text-sm py-2 px-4"
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : editing
              ? "Update POC"
              : "Add POC"}
          </button>
        </div>
      </div>
    </Modal>
  );
}