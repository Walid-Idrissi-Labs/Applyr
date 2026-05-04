import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Shield, Users, Trash2, UserX, UserCheck, Crown } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, u, l] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getAiLogs(),
      ]);
      setStats(s.data);
      setUsers(u.data.data || u.data);
      setAiLogs(l.data.data || l.data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    await adminAPI.deactivate(id);
    loadData();
  };

  const handleActivate = async (id) => {
    await adminAPI.activate(id);
    loadData();
  };

  const handleGrantAdmin = async (id) => {
    await adminAPI.grantAdmin(id);
    loadData();
  };

  const handleRevokeAdmin = async (id) => {
    await adminAPI.revokeAdmin(id);
    loadData();
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Permanently delete this user and ALL their data?')) return;
    await adminAPI.deleteUser(id);
    loadData();
  };

  if (loading) {
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
        backgroundColor: '#111',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 dark:text-white" />
        <h1 className="font-bold text-[20px] tracking-widest dark:text-white">Admin Panel</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        {['users', 'ai_logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[12px] font-bold border-b-2 transition-all ${
              activeTab === tab
                ? 'border-[#111] dark:border-gray-500 text-[#111] dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400'
            }`}
          >
            {tab === 'users' ? 'User Management' : 'AI Logs'}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="neu-card overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b-2 border-[#111] dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a]">
                <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">User</th>
                <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Role</th>
                <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Applications</th>
                <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Joined</th>
                <th className="text-right p-3 font-bold text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <td className="p-3">
                    <div className="font-bold dark:text-white">{u.name}</div>
                    <div className="text-[11px] text-gray-400">{u.email}</div>
                  </td>
                  <td className="p-3">
                    {u.is_admin ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Admin</span>
                    ) : (
                      <span className="text-[10px] text-gray-400">User</span>
                    )}
                  </td>
                  <td className="p-3">
                    {u.is_active ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">Inactive</span>
                    )}
                  </td>
                  <td className="p-3 text-center dark:text-gray-300">{u.applications_count || 0}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2 flex-wrap">
                      {u.is_admin
                        ? <button onClick={() => handleRevokeAdmin(u.id)} className="text-[11px] font-bold text-yellow-600 hover:underline flex items-center gap-1"><Crown className="w-3 h-3" /> Revoke</button>
                        : <button onClick={() => handleGrantAdmin(u.id)} className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"><Crown className="w-3 h-3" /> Grant</button>
                      }
                      {u.is_active
                        ? <button onClick={() => handleDeactivate(u.id)} className="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-1"><UserX className="w-3 h-3" /> Deactivate</button>
                        : <button onClick={() => handleActivate(u.id)} className="text-[11px] font-bold text-green-600 hover:underline flex items-center gap-1"><UserCheck className="w-3 h-3" /> Activate</button>
                      }
                      <button onClick={() => handleDeleteUser(u.id)} className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ai_logs' && (
        <div className="neu-card overflow-hidden">
          {aiLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600">No AI logs yet</div>
          ) : (
            <table className="w-full text-[12px]">
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
          )}
        </div>
      )}
    </div>
  );
}