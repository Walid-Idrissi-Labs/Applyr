import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import { Shield } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [aiLogs, setAiLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAiLogs(),
      ]);
      setStats(s.data);
      setAiLogs(l.data.data || l.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return <div className="flex items-center justify-center h-64"><div className="font-bold dark:text-white">Loading...</div></div>;
  }

  const monthlyData = stats?.monthly_users?.reduce((acc, item) => {
    acc.labels = [...acc.labels, item.month];
    acc.data = [...acc.data, item.count];
    return acc;
  }, { labels: [], data: [] }) || { labels: [], data: [] };

  const chartData = {
    labels: monthlyData.labels.slice().reverse(),
    datasets: [
      {
        label: 'New Users',
        data: monthlyData.data.slice().reverse(),
        borderColor: '#111',
        backgroundColor: 'rgba(17, 17, 17, 0.12)',
        pointBackgroundColor: '#111',
        pointRadius: 3,
        tension: 0.35,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="max-w-5xl w-full mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 dark:text-white" />
        <h1 className="font-bold text-[20px] tracking-widest dark:text-white">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'Total Users', value: stats?.total_users || 0 },
          { label: 'Total Applications', value: stats?.total_applications || 0 },
          { label: 'AI Tokens Used', value: stats?.total_ai_tokens || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="neu-card p-4 border-t-4 border-[#111] dark:border-gray-600">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{label}</div>
            <div className="text-[28px] font-bold dark:text-white">{value}</div>
          </div>
        ))}
      </div>

      {monthlyData.labels.length > 0 && (
        <div className="neu-card p-4">
          <h2 className="font-bold text-[14px] mb-4 dark:text-white">User Growth</h2>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="neu-card overflow-hidden mt-6">
        <div className="p-3 border-b-2 border-[#111] dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a]">
          <h2 className="font-bold text-[14px] dark:text-white">Recent AI Logs</h2>
        </div>
        {aiLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-600">No AI logs yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[12px]">
              <thead>
                <tr className="border-b-2 border-[#111] dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a]">
                  <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">User</th>
                  <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Model</th>
                  <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Purpose</th>
                  <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Tokens</th>
                  <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {aiLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td className="p-3 font-bold dark:text-white">{log.user?.name || 'Unknown'}</td>
                    <td className="p-3 text-gray-500 dark:text-gray-400 text-[11px]">{log.model}</td>
                    <td className="p-3 dark:text-gray-300">{log.purpose}</td>
                    <td className="p-3 dark:text-gray-300">{log.tokens_used}</td>
                    <td className="p-3 text-gray-500 dark:text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}