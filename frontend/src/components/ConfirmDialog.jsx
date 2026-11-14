import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import LoadingButton from './LoadingButton';

export default function ConfirmDialog({ open, title, message, error = '', confirmLabel = 'নিশ্চিত করুন', cancelLabel = 'ফিরে যাই', tone = 'default', loading = false, onConfirm, onCancel }) {
  if (!open) return null;
  const dangerous = tone === 'danger';
  return <div className="confirm-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !loading && onCancel()}>
    <section className={`confirm-dialog ${dangerous ? 'danger' : ''}`} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
      <button className="modal-close" type="button" onClick={onCancel} disabled={loading} aria-label="Close confirmation"><X /></button>
      <span className="confirm-icon">{dangerous ? <AlertTriangle /> : <CheckCircle2 />}</span>
      <h2 id="confirm-title">{title}</h2>
      <p id="confirm-message">{message}</p>
      {error && <div className="confirm-error" role="alert">{error}</div>}
      <div className="confirm-actions">
        <button className="button button-light" type="button" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
        <LoadingButton loading={loading} className={`button ${dangerous ? 'button-danger' : 'button-red'}`} type="button" onClick={onConfirm}>{confirmLabel}</LoadingButton>
      </div>
    </section>
  </div>;
}
