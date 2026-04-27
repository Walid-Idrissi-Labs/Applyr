const renderNotifications = () => {
  const unreadNotifs = state.notifications.filter(n => n.unread).length;

  const notifsHtml = state.notifications.map(n => `
    <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-4 flex gap-4 transition-all ${n.unread ? 'bg-white dark:bg-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]' : 'bg-gray-50 dark:bg-[#111] border-gray-300 dark:border-gray-800 opacity-70'}">
      <div class="shrink-0 mt-0.5">
        <div class="p-2 rounded-lg ${n.unread ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-200 dark:bg-gray-800'} border-2 ${n.unread ? 'border-[#111] dark:border-yellow-600' : 'border-transparent'}">
          <i data-lucide="bell" class="w-4 h-4 ${n.unread ? 'text-[#111] dark:text-yellow-600' : 'text-gray-500'}"></i>
        </div>
      </div>
      <div class="flex-1">
        <div class="flex justify-between items-start mb-1">
          <h4 class="font-bold text-[14px] ${n.unread ? 'text-[#111] dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}">${n.title}</h4>
          <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-white dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">${n.date}</span>
        </div>
        <p class="${n.unread ? 'text-gray-800 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'} mt-1">${n.message}</p>
      </div>
      ${n.unread ? `
        <button 
          onclick="markAsRead(${n.id})"
          class="shrink-0 self-center text-[11px] font-bold border-2 border-transparent hover:border-[#111] dark:hover:border-gray-600 px-3 py-1.5 rounded-md transition-all text-gray-500 hover:text-[#111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Mark Read <i data-lucide="check" class="w-3 h-3 inline"></i>
        </button>
      ` : ''}
    </div>
  `).join('');

  return `
    <div class="max-w-4xl mx-auto h-full flex flex-col transition-colors duration-300">
      <div class="flex justify-between items-end border-b-2 border-[#111] dark:border-gray-800 pb-3 mb-6 shrink-0">
        <h2 class="text-[20px] font-bold flex items-center gap-2 dark:text-white"><i data-lucide="bell" class="w-5 h-5"></i> Notifications</h2>
        ${unreadNotifs > 0 ? `
          <button 
            onclick="markAllAsRead()" 
            class="text-[11px] border-2 border-[#111] dark:border-gray-700 rounded-md px-3 py-1.5 bg-white dark:bg-[#111] hover:bg-[#111] dark:hover:bg-white hover:text-white dark:hover:text-[#111] transition-colors font-bold shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] dark:text-white dark:hover:text-[#111]"
          >
            Mark all as read
          </button>
        ` : ''}
      </div>
      
      <div class="flex-1 overflow-y-auto space-y-4 pb-6 pr-2">
        ${state.notifications.length === 0 ? '<div class="text-gray-500 italic font-bold text-center py-10">No notifications.</div>' : notifsHtml}
      </div>
    </div>
  `;
};
