import { useEffect, useState } from 'react';

export default function WorkspaceLoader({ delay = 2000 }) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return undefined;
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-100 dark:bg-[#0a0a0a] px-6"
      role="status"
      aria-live="polite"
      aria-label="Loading workspace"
    >
      <div className="text-center">
        <div className="workspace-loader-mark mx-auto mb-6" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="font-bold text-[17px] tracking-wider text-[#111] dark:text-white">
          Getting your workspace ready
        </div>
        <p className="mt-2 max-w-sm text-[11px] leading-5 text-gray-500 dark:text-gray-400">
          The server may need a moment to wake up. Your content is on the way.
        </p>
      </div>
    </div>
  );
}
