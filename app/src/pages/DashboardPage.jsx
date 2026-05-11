import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { applicationsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { LayoutDashboard } from 'lucide-react';

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

const IN_PROGRESS_STATUSES = ['wishlist', 'applied', 'interview', 'technical test', 'offer'];

export default function DashboardPage() {
  const { user, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inProgressApps, setInProgressApps] = useState([]);
  const [inProgressLoading, setInProgressLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationSending, setVerificationSending] = useState(false);

  useEffect(() => {
    let isActive = true;

    setLoading(true);
    setInProgressLoading(true);

    applicationsAPI.getDashboard()
      .then((res) => {
        if (isActive) setStats(res.data);
      })
      .catch(() => {
        if (isActive) setError('Failed to load dashboard');
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    applicationsAPI.getAll({ per_page: 50, sort_by: 'updated_at', sort_dir: 'desc' })
      .then((res) => {
        const items = res.data?.data || res.data || [];
        const filtered = items
          .filter((app) => IN_PROGRESS_STATUSES.includes((app.status || '').toLowerCase()))
          .slice(0, 6);
        if (isActive) setInProgressApps(filtered);
      })
      .catch(() => {
        if (isActive) setInProgressApps([]);
      })
      .finally(() => {
        if (isActive) setInProgressLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : 'Good evening';
  }, []);

  const handleSendVerification = async () => {
    setVerificationError('');
    setVerificationStatus('');
    setVerificationSending(true);
    try {
      const res = await sendVerificationEmail();
      setVerificationStatus(res.data?.message || 'Verification link sent.');
    } catch (err) {
      setVerificationError(err.response?.data?.message || 'Unable to send verification email');
    } finally {
      setVerificationSending(false);
    }
  };

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

  const { total, status_counts, response_rate, success_rate, recent_activity = [] } = stats;

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

  const inProgress = (status_counts.wishlist || 0)
    + (status_counts.applied || 0)
    + (status_counts.interview || 0)
    + (status_counts['technical test'] || 0)
    + (status_counts.offer || 0);

  const recentActivitySection = (
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
  );

  const statsSection = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
  );

  const analyticsSection = (
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
  );

  const inProgressSection = (
    <div className="neu-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[14px] dark:text-white">In-Progress Applications</h2>
        <button
          onClick={() => navigate('/applications')}
          className="neu-btn-outline text-[10px] px-3 py-1"
          type="button"
        >
          View all
        </button>
      </div>
      {inProgressLoading ? (
        <div className="text-center py-6 text-gray-400 dark:text-gray-600">Loading in-progress applications...</div>
      ) : inProgressApps.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-gray-400 dark:text-gray-600 text-[12px]">No in-progress applications yet</div>
          <button
            onClick={() => navigate('/applications')}
            className="mt-3 neu-btn-outline text-[11px]"
            type="button"
          >
            Add your first application
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {inProgressApps.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => navigate(`/applications/${app.id}`)}
              className="w-full text-left flex items-center justify-between gap-4 p-3 border-2 border-gray-100 dark:border-gray-800 rounded-lg hover:border-[#111] dark:hover:border-gray-600 transition-all"
            >
              <div>
                <div className="font-bold text-[12px] dark:text-white">{app.company_name}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{app.position}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={app.status} />
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto w-full min-h-full pb-8 flex flex-col transition-colors duration-300 space-y-6">
      <h1 className="font-bold text-[20px] flex items-center gap-2 dark:text-white tracking-widest"><LayoutDashboard className="w-5 h-5" /> Dashboard</h1>
      <div className="space-y-1">
        <h2 className="font-bold text-[18px] dark:text-gray-200">
          {greeting}, <span className="font-bold">{user?.name}</span>
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Great Job on your Recent Activity.
        </p>
      </div>

      {!user?.email_verified_at && (
        <div className="neu-card p-4 border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-700 space-y-3">
          <div>
            <div className="font-bold text-[13px] text-yellow-800 dark:text-yellow-200">Verify your email</div>
            <div className="text-[11px] text-yellow-700 dark:text-yellow-300">
              Confirm your email to receive reminders and updates.
            </div>
          </div>
          {verificationStatus && (
            <div className="text-[11px] text-green-700 dark:text-green-300">
              {verificationStatus}
            </div>
          )}
          {verificationError && (
            <div className="text-[11px] text-red-700 dark:text-red-300">
              {verificationError}
            </div>
          )}
          <button
            type="button"
            onClick={handleSendVerification}
            disabled={verificationSending}
            className="neu-btn text-[11px] w-max"
          >
            {verificationSending ? 'Sending...' : 'Send verification link'}
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recentActivitySection}
          {inProgressSection}
        </div>
        {statsSection}
        {analyticsSection}
      </div>
    </div>
  );
}