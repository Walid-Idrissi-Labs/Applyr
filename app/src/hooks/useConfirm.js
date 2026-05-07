import { useState, useCallback } from 'react';
import ConfirmationDialog from './ConfirmationDialog';

export function useConfirm() {
  const [config, setConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'warning',
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'warning',
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    config.resolve?.(true);
    setConfig((prev) => ({ ...prev, isOpen: false }));
  }, [config.resolve]);

  const handleCancel = useCallback(() => {
    config.resolve?.(false);
    setConfig((prev) => ({ ...prev, isOpen: false }));
  }, [config.resolve]);

  const ConfirmationDialogComponent = useCallback(
    () => (
      <ConfirmationDialog
        isOpen={config.isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        variant={config.variant}
      />
    ),
    [config, handleConfirm, handleCancel]
  );

  return { confirm, ConfirmationDialog: ConfirmationDialogComponent };
}