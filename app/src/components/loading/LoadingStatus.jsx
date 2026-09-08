export default function LoadingStatus({ label, tone = 'default' }) {
  return (
    <div
      className={`loading-transition-status loading-transition-status--${tone}`}
      role="status"
      aria-live="polite"
    >
      <span className="loading-transition-spinner" aria-hidden="true" />
      <span className="loading-transition-label">{label}</span>
    </div>
  );
}
