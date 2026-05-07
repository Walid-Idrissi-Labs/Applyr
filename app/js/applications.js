const renderCandidatures = () => {
  const filteredApps = state.applications.filter(app => {
    const matchesStatus = state.statusFilter === 'All' || app.status === state.statusFilter;
    const matchesSearch = 
      app.company.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusOptions = STATUSES.map(s => 
    `<option value="${s}" ${state.statusFilter === s ? 'selected' : ''}>${s}</option>`
  ).join('');

  return `
    <div class="h-full flex flex-col max-w-6xl mx-auto transition-colors duration-300">
      <h2 class="text-[20px] mb-5 font-bold flex items-center gap-2 dark:text-white"><i data-lucide="briefcase" class="w-5 h-5"></i> My Applications</h2>
      
      <div class="flex flex-wrap gap-3 mb-5 items-center shrink-0 bg-gray-50 dark:bg-[#111] p-3 rounded-xl border-2 border-[#111] dark:border-gray-800">
        <div class="flex-1 min-w-[200px] relative">
          <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
          <input 
            type="text" 
            placeholder="Search..." 
            value="${state.searchQuery}"
            oninput="handleSearch(event)"
            class="w-full border-2 border-[#111] dark:border-gray-700 rounded-lg py-2 pl-10 pr-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white"
          />
        </div>
        <select 
          onchange="handleFilter(event)"
          class="border-2 border-[#111] dark:border-gray-700 rounded-lg p-2 text-[12px] bg-white dark:bg-[#0a0a0a] dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500"
        >
          ${statusOptions}
        </select>
        <div class="flex border-2 border-[#111] dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-[#0a0a0a]">
          <button onclick="handleViewMode('list')" class="px-3 py-2 ${state.viewMode === 'list' ? 'bg-[#111] dark:bg-white text-white dark:text-[#111]' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'} transition-colors"><i data-lucide="list" class="w-4 h-4"></i></button>
          <button onclick="handleViewMode('board')" class="px-3 py-2 border-l-2 border-[#111] dark:border-gray-700 ${state.viewMode === 'board' ? 'bg-[#111] dark:bg-white text-white dark:text-[#111]' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'} transition-colors"><i data-lucide="columns" class="w-4 h-4"></i></button>
        </div>
        <button 
          onclick="openForm()"
          class="border-2 border-[#111] dark:border-gray-700 rounded-lg bg-[#111] dark:bg-white text-white dark:text-[#111] px-4 py-2 font-bold hover:bg-white dark:hover:bg-[#eee] hover:text-[#111] transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] flex items-center gap-2"
        >
          <i data-lucide="plus" class="w-4 h-4"></i> Add
        </button>
      </div>

      <div class="flex-1 overflow-hidden">
        ${state.viewMode === 'list' ? renderList(filteredApps) : renderBoard(filteredApps)}
      </div>
    </div>
  `;
};

const renderList = (filteredApps) => {
  const rows = filteredApps.map((app, i) => `
    <tr class="${i % 2 === 0 ? 'bg-white dark:bg-[#111]' : 'bg-gray-50 dark:bg-[#1a1a1a]'} border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <td class="p-3 border-r border-gray-200 dark:border-gray-800 font-bold dark:text-white">${app.company}</td>
      <td class="p-3 border-r border-gray-200 dark:border-gray-800 dark:text-gray-300">${app.role}</td>
      <td class="p-3 border-r border-gray-200 dark:border-gray-800">
        <span class="inline-block border-2 border-[#111] dark:border-gray-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-white dark:bg-[#0a0a0a] rounded-md dark:text-gray-300">
          ${app.status}
        </span>
      </td>
      <td class="p-3 border-r border-gray-200 dark:border-gray-800 dark:text-gray-400">${formatDate(app.appliedDate)}</td>
      <td class="p-3 border-r border-gray-200 dark:border-gray-800 dark:text-gray-400">${formatDate(app.reminderDate)}</td>
      <td class="p-3">
        <div class="flex gap-2 justify-center">
          <button onclick="openDetail(${app.id})" class="p-1.5 border-2 border-transparent hover:border-[#111] dark:hover:border-gray-500 rounded-md transition-colors dark:text-gray-400 hover:text-[#111] dark:hover:text-white" title="View"><i data-lucide="eye" class="w-4 h-4"></i></button>
          <button onclick="openForm(${app.id})" class="p-1.5 border-2 border-transparent hover:border-blue-600 text-blue-600 rounded-md transition-colors" title="Edit"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
          <button onclick="deleteApp(${app.id})" class="p-1.5 border-2 border-transparent hover:border-red-600 text-red-600 rounded-md transition-colors" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div class="h-full overflow-auto border-2 border-[#111] dark:border-gray-800 rounded-xl shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
      <table class="w-full border-collapse">
        <thead class="bg-gray-100 dark:bg-[#1a1a1a] sticky top-0 border-b-2 border-[#111] dark:border-gray-800 z-10">
          <tr>
            <th class="text-left p-3 border-r-2 border-[#111] dark:border-gray-800 font-bold dark:text-gray-300">Company</th>
            <th class="text-left p-3 border-r-2 border-[#111] dark:border-gray-800 font-bold dark:text-gray-300">Role</th>
            <th class="text-left p-3 border-r-2 border-[#111] dark:border-gray-800 font-bold dark:text-gray-300">Status</th>
            <th class="text-left p-3 border-r-2 border-[#111] dark:border-gray-800 font-bold dark:text-gray-300">Applied On</th>
            <th class="text-left p-3 border-r-2 border-[#111] dark:border-gray-800 font-bold dark:text-gray-300">Follow-up</th>
            <th class="text-center p-3 font-bold dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody class="dark:bg-[#111]">
          ${filteredApps.length > 0 ? rows : `<tr><td colspan="6" class="p-8 text-center text-gray-500 font-bold">No applications found.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
};

const renderBoard = (filteredApps) => {
  const cols = STATUSES.filter(s => s !== 'All' && (state.statusFilter === 'All' || s === state.statusFilter)).map(status => {
    const colApps = filteredApps.filter(a => a.status === status);
    
    const cards = colApps.map(app => `
      <div 
        draggable="true"
        ondragstart="handleDragStart(event, ${app.id})"
        ondragend="handleDragEnd(event)"
        onclick="openDetail(${app.id})"
        class="bg-white dark:bg-[#1a1a1a] border-2 border-[#111] dark:border-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#222] transition-all group relative shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-y-[3px] hover:translate-x-[3px]"
      >
        <i data-lucide="grip-vertical" class="h-4 w-4 absolute right-2 top-3 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        <div class="font-bold text-[14px] truncate pr-5 mb-1 dark:text-white">${app.company}</div>
        <div class="text-[12px] text-gray-600 dark:text-gray-400 truncate mb-3">${app.role}</div>
        
        <div class="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-500 border-t-2 border-dashed border-gray-200 dark:border-gray-800 pt-2">
          <div class="flex gap-2">
            ${app.attachments && app.attachments.length > 0 ? `<span class="flex items-center gap-1"><i data-lucide="paperclip" class="h-3 w-3"></i>${app.attachments.length}</span>` : ''}
            ${app.tasks && app.tasks.length > 0 ? `<span class="flex items-center gap-1 ${app.tasks.every(t=>t.done) ? 'text-green-600' : ''}"><i data-lucide="check-square" class="h-3 w-3"></i>${app.tasks.filter(t=>t.done).length}/${app.tasks.length}</span>` : ''}
          </div>
          <span class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-sm">${formatShortDate(app.appliedDate)}</span>
        </div>
      </div>
    `).join('');

    return `
      <div 
        ondragover="handleDragOver(event)"
        ondrop="handleDrop(event, '${status}')"
        class="min-w-[280px] w-[280px] flex flex-col bg-gray-100/50 dark:bg-[#111]/50 border-2 border-[#111] dark:border-gray-800 rounded-xl shrink-0 max-h-full overflow-hidden"
      >
        <div class="p-3 border-b-2 border-[#111] dark:border-gray-800 font-bold flex justify-between items-center bg-white dark:bg-[#1a1a1a]">
          <span class="uppercase tracking-wider text-[12px] truncate pr-2 dark:text-white">${status}</span>
          <span class="bg-gray-100 dark:bg-gray-800 border-2 border-[#111] dark:border-gray-700 px-2 py-0.5 text-[11px] rounded-md shrink-0 dark:text-gray-300">${colApps.length}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-3 min-h-[100px] hide-scrollbar pb-10">
          ${cards}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="h-full flex gap-4 overflow-x-auto pb-4 items-start">
      ${cols}
    </div>
  `;
};
