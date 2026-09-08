import { useEffect, useState } from 'react';
import LoadingStatus from './LoadingStatus';

const PAGES = [
  { x: '-8px', y: '6px', rotation: '-7deg', startX: '-154px', startY: '-16px', startRotation: '-17deg' },
  { x: '-5px', y: '4px', rotation: '-4deg', startX: '158px', startY: '-30px', startRotation: '19deg' },
  { x: '-2px', y: '2px', rotation: '-1deg', startX: '-162px', startY: '18px', startRotation: '-14deg' },
  { x: '2px', y: '-1px', rotation: '2deg', startX: '150px', startY: '23px', startRotation: '16deg' },
  { x: '5px', y: '-3px', rotation: '5deg', startX: '-150px', startY: '-37px', startRotation: '-19deg' },
  { x: '8px', y: '-5px', rotation: '8deg', startX: '164px', startY: '10px', startRotation: '21deg' },
  { x: '-6px', y: '5px', rotation: '-6deg', startX: '-159px', startY: '31px', startRotation: '-16deg' },
  { x: '4px', y: '-2px', rotation: '4deg', startX: '153px', startY: '-43px', startRotation: '18deg' },
  { x: '-3px', y: '2px', rotation: '-2deg', startX: '-165px', startY: '-4px', startRotation: '-20deg' },
  { x: '6px', y: '-4px', rotation: '7deg', startX: '161px', startY: '35px', startRotation: '17deg' },
];

export default function WorkspaceLoader({
  delay = 2000,
  variant = 'opening',
  statusLabel,
  title = 'Getting your workspace ready',
  message = 'The server may need a moment to wake up. Your content is on the way.',
}) {
  const [visible, setVisible] = useState(delay === 0);
  const resolvedStatusLabel = statusLabel || (variant === 'closing' ? 'Logging out' : 'Logging in');

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
      aria-label={title}
    >
      <LoadingStatus
        label={resolvedStatusLabel}
        tone={variant === 'closing' ? 'logout' : 'default'}
      />
      <div className={`workspace-loader-panel workspace-loader-panel--${variant}`}>
        <div className="workspace-page-window" aria-hidden="true">
          <div className="workspace-page-stack">
            {PAGES.map((page, index) => (
              <span
                key={index}
                className="workspace-loader-page"
                style={{
                  '--page-x': page.x,
                  '--page-y': page.y,
                  '--page-rotation': page.rotation,
                  '--page-start-x': page.startX,
                  '--page-start-y': page.startY,
                  '--page-start-rotation': page.startRotation,
                  '--page-delay': `${index * -0.68}s`,
                  '--page-layer': PAGES.length - index,
                }}
              />
            ))}
          </div>
        </div>
        <div className="workspace-loader-copy text-center">
          <div className={`font-bold text-[15px] tracking-wide ${
            variant === 'closing' ? 'text-red-700 dark:text-red-400' : 'text-[#111] dark:text-white'
          }`}>
            {title}
          </div>
          <p className="mt-1.5 text-[10px] leading-4 text-gray-500 dark:text-gray-400">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
