import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-ghost text-sm py-2 px-4">Cancel</button>
        <button onClick={onConfirm} className={danger ? 'btn-danger text-sm py-2 px-4' : 'btn-primary text-sm py-2 px-4'}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
