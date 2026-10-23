import React, { useEffect } from 'react';
import { TrashIcon, AlertTriangleIcon, CheckCircleIcon, XIcon, ShieldCheckIcon } from './Icons';

/**
 * Modern, High-End Confirmation Modal
 * Replaces crude browser window.confirm() dialogs with an attractive, themed modal.
 */
export function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message,
  itemName,
  itemId,
  warningNote = 'This action cannot be undone and will permanently remove this record from the active database.',
  confirmText = 'Yes, Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info' | 'success'
  onConfirm,
  onCancel
}) {
  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKey = (e) => {
        if (e.key === 'Escape') onCancel?.();
        if (e.key === 'Enter') onConfirm?.();
      };
      window.addEventListener('keydown', handleKey);
      return () => {
        document.body.style.overflow = orig || '';
        window.removeEventListener('keydown', handleKey);
      };
    }
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          border: isDanger ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(244, 63, 94, 0.15)',
          textAlign: 'center',
          position: 'relative',
          animation: 'alertModalScaleIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both'
        }}
      >
        {/* Top-Right Quick Close */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'var(--bg-muted)',
            border: 'none',
            borderRadius: '50%',
            width: '1.85rem',
            height: '1.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
          title="Close dialog"
        >
          <XIcon size={14} />
        </button>

        {/* Pulsing Animated Icon Header */}
        <div style={{
          width: '4rem',
          height: '4rem',
          margin: '0 auto 1.25rem',
          borderRadius: '50%',
          backgroundColor: isDanger ? 'rgba(244, 63, 94, 0.12)' : (isWarning ? 'rgba(245, 158, 11, 0.12)' : 'rgba(2, 132, 199, 0.12)'),
          color: isDanger ? '#fb7185' : (isWarning ? '#f59e0b' : '#38bdf8'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: isDanger ? 'pulseGlowRed 2s infinite' : 'none',
          border: isDanger ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(2, 132, 199, 0.3)'
        }}>
          {isDanger ? <TrashIcon size={26} color="#f43f5e" /> : (isWarning ? <AlertTriangleIcon size={26} color="#f59e0b" /> : <ShieldCheckIcon size={26} color="#0284c7" />)}
        </div>

        {/* Modal Title */}
        <h3 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          margin: '0 0 0.5rem',
          lineHeight: 1.2
        }}>
          {title}
        </h3>

        {/* Main Message Content */}
        <p style={{
          fontSize: '0.92rem',
          color: 'var(--text-muted)',
          margin: '0 0 1rem',
          lineHeight: 1.5
        }}>
          {message}
        </p>

        {/* Target Item Highlight Card (if specified) */}
        {(itemName || itemId) && (
          <div style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            maxWidth: '100%',
            wordBreak: 'break-word'
          }}>
            {itemId && (
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', backgroundColor: 'var(--primary-subtle)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                {itemId}
              </span>
            )}
            <span>{itemName}</span>
          </div>
        )}

        {/* Warning Callout Box */}
        {warningNote && (
          <div style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: isDanger ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: isDanger ? '1px dashed rgba(244, 63, 94, 0.3)' : '1px dashed rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: isDanger ? '#e11d48' : '#d97706',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}>
            <AlertTriangleIcon size={14} color="currentColor" />
            <span>{warningNote}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            style={{
              padding: '0.75rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={isDanger ? 'btn btn-danger' : 'btn btn-primary'}
            style={{
              padding: '0.75rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow: isDanger ? '0 4px 14px rgba(244, 63, 94, 0.35)' : '0 4px 14px rgba(2, 132, 199, 0.35)'
            }}
          >
            {isDanger && <TrashIcon size={16} color="#ffffff" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modern Toast Notifications Container
 * Floats in the top-right corner to replace harsh window.alert() popups
 */
export function ToastContainer({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1.25rem',
      right: '1.25rem',
      zIndex: 1200,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      maxWidth: '380px',
      width: 'calc(100% - 2.5rem)',
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isDanger = toast.type === 'danger' || toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.35)' : (isDanger ? 'rgba(244, 63, 94, 0.35)' : (isWarning ? 'rgba(245, 158, 11, 0.35)' : 'rgba(2, 132, 199, 0.35)'))}`,
              borderLeft: `4px solid ${isSuccess ? '#10b981' : (isDanger ? '#f43f5e' : (isWarning ? '#f59e0b' : '#0284c7'))}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
              backdropFilter: 'blur(12px)',
              position: 'relative'
            }}
          >
            {/* Status Icon */}
            <div style={{
              marginTop: '0.1rem',
              flexShrink: 0,
              color: isSuccess ? '#10b981' : (isDanger ? '#f43f5e' : (isWarning ? '#f59e0b' : '#0284c7'))
            }}>
              {isSuccess && <CheckCircleIcon size={18} color="#10b981" />}
              {isDanger && <AlertTriangleIcon size={18} color="#f43f5e" />}
              {isWarning && <AlertTriangleIcon size={18} color="#f59e0b" />}
              {!isSuccess && !isDanger && !isWarning && <ShieldCheckIcon size={18} color="#0284c7" />}
            </div>

            {/* Message Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.15rem' }}>
                  {toast.title}
                </div>
              )}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, wordBreak: 'break-word' }}>
                {toast.message}
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => onDismiss?.(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.2rem',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                lineHeight: 1,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s ease'
              }}
              title="Dismiss notification"
            >
              <XIcon size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
