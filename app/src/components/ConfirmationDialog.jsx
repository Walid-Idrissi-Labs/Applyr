import { AlertTriangle, X, Check } from 'lucide-react';

export default function ConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
}) {
  if (!isOpen) return null;

  const isDestructive = variant === 'destructive';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] w-full max-w-md">
        <div className="flex items-center gap-3 p-4 border-b-2 border-[#111] dark:border-gray-800">
          <div className={`p-2 rounded-lg ${isDestructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
            <AlertTriangle className={`w-5 h-5 ${isDestructive ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
          </div>
          <h2 className="font-bold text-[16px] dark:text-white flex-1">{title}</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-[13px] text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        <div className="flex gap-3 p-4 pt-0">
          <button
            onClick={onConfirm}
            className={`neu-btn flex-1 text-[12px] flex items-center justify-center gap-2 ${
              isDestructive ? 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800' : ''
            }`}
          >
            <Check className="w-4 h-4" />
            {confirmText}
          </button>
          <button onClick={onCancel} className="neu-btn-outline flex-1 text-[12px]">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}