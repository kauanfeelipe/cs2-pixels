"use client";

import styles from "../dashboard.module.css";

type ConfirmDialogProps = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title = "Confirm action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.5"/><path d="M12 7v7" stroke="#ef4444" strokeWidth="1.5"/><circle cx="12" cy="17" r="1" fill="#ef4444"/></svg>
          <h3>{title}</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>{description}</p>
        <div className={styles.modalActions}>
          <button className={styles.buttonSecondary} type="button" onClick={onCancel}>{cancelText}</button>
          <button className={styles.buttonPrimary} type="button" onClick={onConfirm} style={{ backgroundColor: '#b91c1c' }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}


