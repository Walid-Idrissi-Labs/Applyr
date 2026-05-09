const renderDashboard = () => {
  const stats = {
    total: state.applications.length,
    active: state.applications.filter(a => ACTIVE_STATUSES.includes(a.status)).length,
    refus: state.applications.filter(a => a.status === 'Rejected').length,
    acceptees: state.applications.filter(a => a.status === 'Accepted').length,
  };

  const interviewRate = stats.total > 0 ? Math.round((state.applications.filter(a => ['Interview', 'Offer', 'Accepted'].includes(a.status)).length / stats.total)*100) : 0;

  const statusCounts = STATUSES.filter(s => s !== 'All').map(s => {
    const c = state.applications.filter(a => a.status === s).length;
    return c > 0 ? `<span class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">${s} ${c}</span>` : null;
  }).filter(Boolean).join('');

  const recentActivity = state.applications.slice(0,5).map(app => {
    const lastHist = app.history[app.history.length-1];
    return `
      <div class="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors">
        <span class="truncate pr-4 font-bold dark:text-gray-200">${app.company} <span class="font-normal text-gray-500 ml-1">– ${app.status}</span></span>
        <span class="text-[#666] dark:text-gray-400 shrink-0 text-[11px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-sm">${lastHist ? formatShortDate(lastHist.date) : '—'}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="max-w-5xl mx-auto h-full transition-colors duration-300">
      <h2 class="text-[20px] mb-6 font-bold flex items-center gap-2 dark:text-white"><i data-lucide="layout-dashboard" class="w-5 h-5"></i> Dashboard</h2>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-4 text-center bg-gray-50 dark:bg-[#111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]">
          <div class="text-[32px] font-bold leading-none dark:text-white">${stats.total}</div>
          <div class="text-[11px] text-[#555] dark:text-gray-400 mt-2 uppercase tracking-wider font-bold">Total</div>
        </div>
        <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-4 text-center bg-blue-50 dark:bg-blue-900/20 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]">
          <div class="text-[32px] font-bold leading-none text-blue-700 dark:text-blue-400">${stats.active}</div>
          <div class="text-[11px] text-blue-700 dark:text-blue-400 mt-2 uppercase tracking-wider font-bold">Active</div>
        </div>
        <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-4 text-center bg-red-50 dark:bg-red-900/20 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]">
          <div class="text-[32px] font-bold leading-none text-red-700 dark:text-red-400">${stats.refus}</div>
          <div class="text-[11px] text-red-700 dark:text-red-400 mt-2 uppercase tracking-wider font-bold">Rejected</div>
        </div>
        <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-4 text-center bg-green-50 dark:bg-green-900/20 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]">
          <div class="text-[32px] font-bold leading-none text-green-700 dark:text-green-400">${stats.acceptees}</div>
          <div class="text-[11px] text-green-700 dark:text-green-400 mt-2 uppercase tracking-wider font-bold">Accepted</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] bg-white dark:bg-[#111]">
          <h3 class="text-[14px] font-bold border-b-2 border-gray-100 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2 dark:text-white"><i data-lucide="pie-chart" class="w-4 h-4"></i> Status Breakdown</h3>
          <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg h-[120px] flex items-center justify-center text-gray-500 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-[#0a0a0a]">
            [ Chart ]
          </div>
          <div class="text-[11px] text-[#555] dark:text-gray-400 mt-2 font-bold leading-relaxed flex flex-wrap gap-2">
            ${statusCounts || 'No data'}
          </div>
        </div>

        <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] bg-white dark:bg-[#111]">
          <h3 class="text-[14px] font-bold border-b-2 border-gray-100 dark:border-gray-800 pb-2 mb-2 flex items-center gap-2 dark:text-white"><i data-lucide="activity" class="w-4 h-4"></i> Recent Activity</h3>
          <div class="space-y-0">
            ${recentActivity || '<div class="text-gray-500 italic py-4 text-center">No activity.</div>'}
          </div>
        </div>
      </div>

      <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] bg-white dark:bg-[#111]">
        <h3 class="text-[14px] font-bold border-b-2 border-gray-100 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2 dark:text-white"><i data-lucide="bar-chart-2" class="w-4 h-4"></i> Key Metrics</h3>
        <div class="space-y-5">
          <div>
            <div class="flex justify-between text-[12px] mb-2 font-bold dark:text-gray-300">
              <span>Conversion Rate (Interviews)</span>
              <span>${interviewRate}%</span>
            </div>
            <div class="h-4 bg-gray-100 dark:bg-gray-800 border-2 border-[#111] dark:border-gray-700 rounded-full overflow-hidden w-full relative">
              <div class="h-full bg-[#111] dark:bg-white transition-all duration-1000" style="width: ${interviewRate}%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};
