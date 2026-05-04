import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { applicationsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  wishlist: '#9ca3af',
  applied: '#3b82f6',
  interview: '#eab308',
  'technical test': '#a855f7',
  offer: '#22c55e',
  accepted: '#16a34a',
  rejected: '#ef4444',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    applicationsAPI.getDashboard()
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#111] dark:text-white font-bold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const { total, status_counts, response_rate, success_rate, recent_activity } = stats;

  const chartLabels = Object.keys(status_counts).filter((s) => status_counts[s] > 0);
  const chartData = chartLabels.map((s) => status_counts[s]);
  const chartColors = chartLabels.map((s) => STATUS_COLORS[s] || '#9ca3af');

  const pieData = {
    labels: chartLabels.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: chartData,
        backgroundColor: chartColors,
        borderColor: chartColors,
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'ui-monospace', size: 11 },
          color: user?.is_admin ? '#fff' : '#111',
        },
      },
    },
  };

  const inProgress = (status_counts.wishlist || 0) + (status_counts.applied || 0) + (status_counts.interview || 0) + (status_counts['technical test'] || 0) + (status_counts.offer || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-[20px] tracking-widest dark:text-white">Dashboard</h1>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">
          Welcome back, <span className="font-bold">{user?.name}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, color: 'border-[#111] dark:border-gray-600' },
          { label: 'In Progress', value: inProgress, color: 'border-blue-400' },
          { label: 'Rejections', value: status_counts.rejected || 0, color: 'border-red-400' },
          { label: 'Accepted', value: status_counts.accepted || 0, color: 'border-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`neu-card p-4 border-t-4 ${color}`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{label}</div>
            <div className="text-[28px] font-bold dark:text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="neu-card p-4 lg:col-span-2">
          <h2 className="font-bold text-[14px] mb-4 dark:text-white">Status Breakdown</h2>
          {chartLabels.length > 0 ? (
            <div className="w-full max-w-xs mx-auto">
              <Pie data={pieData} options={pieOptions} />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600">No applications yet</div>
          )}
        </div>

        <div className="neu-card p-4">
          <h2 className="font-bold text-[14px] mb-4 dark:text-white">Key Indicators</h2>
          <div className="space-y-4">
            <div className="p-3 border-2 border-[#111] dark:border-gray-700 rounded-lg">
              <div className="text-[11px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Response Rate</div>
              <div className="text-[24px] font-bold dark:text-white">{response_rate}%</div>
            </div>
            <div className="p-3 border-2 border-[#111] dark:border-gray-700 rounded-lg">
              <div className="text-[11px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Success Rate</div>
              <div className="text-[24px] font-bold dark:text-white">{success_rate}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="neu-card p-4">
        <h2 className="font-bold text-[14px] mb-4 dark:text-white">Recent Activity</h2>
        {recent_activity.length === 0 ? (
          <div className="text-center py-6 text-gray-400 dark:text-gray-600">No recent activity</div>
        ) : (
          <div className="space-y-3">
            {recent_activity.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <StatusBadge status={item.new_status} />
                  <div className="text-[12px] dark:text-gray-300">
                    <span className="font-bold">{item.application?.company_name}</span>
                    <span className="text-gray-500 dark:text-gray-500 ml-2">{item.application?.position}</span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 dark:text-gray-500">
                  {new Date(item.changed_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}