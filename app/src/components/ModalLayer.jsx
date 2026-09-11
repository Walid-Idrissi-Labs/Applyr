import { createPortal } from 'react-dom';

export default function ModalLayer({ children, className = '' }) {
  return createPortal(
    <div className={`app-modal-layer fixed inset-0 z-[200] ${className}`}>
      {children}
    </div>,
    document.body,
  );
}
