const STATUS_COLORS = {
  wishlist: 'bg-gray-200 text-gray-700',
  applied: 'bg-blue-100 text-blue-800',
  interview: 'bg-yellow-100 text-yellow-800',
  'technical test': 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  accepted: 'bg-green-200 text-green-900',
  rejected: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }) {
  const colorClass = STATUS_COLORS[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`status-badge ${colorClass}`}>
      {status}
    </span>
  );
}