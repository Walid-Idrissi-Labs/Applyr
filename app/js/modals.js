const renderFormModal = () => {
  const app = state.editingApp || {};
  
  const statusOptions = STATUSES.filter(s => s !== 'All').map(s => 
    `<option value="${s}" ${state.formStatus === s ? 'selected' : ''}>${s}</option>`
  ).join('');

  return `
    <div class="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm transition-opacity duration-300">
      <div class="bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-2xl w-full max-w-3xl m-auto shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] flex flex-col relative max-h-[90vh] transition-colors">
        <div class="border-b-2 border-[#111] dark:border-gray-800 p-5 flex justify-between items-center bg-gray-50 dark:bg-[#1a1a1a] rounded-t-2xl shrink-0">
          <h2 class="font-bold text-[18px] dark:text-white">${state.editingApp ? 'Edit Application' : 'Add Application'}</h2>
          <button onclick="closeModal()" type="button" class="hover:bg-gray-200 dark:hover:bg-gray-800 p-1.5 border-2 border-transparent hover:border-[#111] dark:hover:border-gray-600 rounded-md transition-all dark:text-white"><i data-lucide="x" class="h-5 w-5"></i></button>
        </div>
        
        <form onsubmit="saveApp(event)" class="p-6 overflow-y-auto flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
            <div class="flex flex-col gap-1.5">
              <label class="font-bold text-[12px] dark:text-gray-400">Company <span class="text-red-500">*</span></label>
              <input required name="company" value="${app.company || ''}" placeholder="e.g. Google" class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-bold text-[12px] dark:text-gray-400">Role <span class="text-red-500">*</span></label>
              <input required name="role" value="${app.role || ''}" placeholder="e.g. Software Engineer" class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
            </div>
            
            <div class="flex flex-col gap-1.5">
              <label class="font-bold text-[12px] dark:text-gray-400">Status <span class="text-red-500">*</span></label>
              <select required name="status" onchange="handleFormStatusChange(event)" class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 bg-white dark:bg-[#0a0a0a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 cursor-pointer">
                ${statusOptions}
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-bold text-[12px] dark:text-gray-400">Date Applied</label>
              <input type="date" name="appliedDate" value="${app.appliedDate || ''}" class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="font-bold text-[12px] dark:text-gray-400">Job Link</label>
              <input type="url" name="url" value="${app.url || ''}" placeholder="https://..." class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-bold text-[12px] dark:text-gray-400">Source</label>
              <input type="text" name="source" value="${app.source || ''}" placeholder="e.g. LinkedIn, Indeed" class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="font-bold text-[12px] dark:text-gray-400">Follow-up Date</label>
              <input type="date" name="reminderDate" value="${app.reminderDate || ''}" class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-bold text-[12px] dark:text-gray-400">Tags</label>
              <input type="text" name="tags" value="${app.tags || ''}" placeholder="e.g. tech, startup" class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
            </div>

            <div class="md:col-span-2 flex flex-col gap-1.5">
              <label class="font-bold text-[12px] dark:text-gray-400">Notes</label>
              <textarea name="notes" rows="3" placeholder="Company information, contacts..." class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white resize-y">${app.notes || ''}</textarea>
            </div>
          </div>

          <div id="form-resources" class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t-2 border-dashed border-gray-200 dark:border-gray-800">
            ${renderFormResources()}
          </div>

          <div class="flex justify-end gap-3 pt-8 mt-6 border-t-2 border-[#111] dark:border-gray-700">
            <button type="button" onclick="closeModal()" class="border-2 border-[#111] dark:border-gray-600 rounded-md bg-white dark:bg-transparent text-[#111] dark:text-gray-300 px-5 py-2 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
            <button type="submit" class="border-2 border-[#111] dark:border-gray-700 rounded-md bg-[#111] dark:bg-white text-white dark:text-[#111] px-6 py-2 font-bold hover:bg-white dark:hover:bg-[#eee] hover:text-[#111] transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
};

const renderFormResources = () => {
  const tasksHtml = state.currentTasks.map(t => `
    <div class="flex gap-3 items-center border-2 border-gray-200 dark:border-gray-800 rounded-md p-2 bg-gray-50 dark:bg-[#1a1a1a]">
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${t.id})" class="w-4 h-4 accent-[#111] dark:accent-white cursor-pointer shrink-0" />
      <input type="text" value="${t.text}" oninput="updateTaskText(${t.id}, event)" class="bg-transparent dark:text-gray-200 flex-1 focus:outline-none text-[12px] border-b-2 border-transparent focus:border-[#111] dark:focus:border-white font-bold" />
      <button type="button" onclick="removeTask(${t.id})" class="text-gray-400 hover:text-red-500 shrink-0"><i data-lucide="x" class="h-4 w-4"></i></button>
    </div>
  `).join('');

  const attHtml = state.currentAttachments.map(f => `
    <div class="flex justify-between items-center border-2 border-gray-200 dark:border-gray-800 rounded-md p-2 bg-gray-50 dark:bg-[#1a1a1a] text-[12px]">
      <span class="truncate flex items-center gap-2 font-bold dark:text-gray-200"><i data-lucide="file-text" class="h-4 w-4 text-gray-500"></i> ${f.name}</span>
      <div class="flex items-center gap-3 shrink-0">
        <span class="text-[10px] text-gray-500 font-bold bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">${f.size}</span>
        <button type="button" onclick="removeAttachment(${f.id})" class="text-gray-400 hover:text-red-500"><i data-lucide="x" class="h-4 w-4"></i></button>
      </div>
    </div>
  `).join('');

  return `
    <div>
      <div class="flex justify-between items-center mb-3">
        <label class="font-bold flex items-center gap-2 text-[14px] dark:text-gray-300"><i data-lucide="check-square" class="h-4 w-4"></i> Tasks</label>
        <button type="button" onclick="addTask()" class="text-[11px] font-bold border-2 border-[#111] dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-[#0a0a0a] dark:text-gray-300 hover:bg-[#111] dark:hover:bg-white hover:text-white dark:hover:text-[#111] transition-colors">+ Task</button>
      </div>
      <div class="space-y-2">
        ${state.currentTasks.length === 0 ? '<div class="text-[12px] text-gray-500 italic p-3 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md text-center">No tasks.</div>' : tasksHtml}
      </div>
    </div>

    <div>
      <div class="flex justify-between items-center mb-3">
        <label class="font-bold flex items-center gap-2 text-[14px] dark:text-gray-300"><i data-lucide="paperclip" class="h-4 w-4"></i> Documents</label>
        <button type="button" onclick="triggerFileUpload()" class="text-[11px] font-bold border-2 border-[#111] dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-[#0a0a0a] dark:text-gray-300 hover:bg-[#111] dark:hover:bg-white hover:text-white dark:hover:text-[#111] flex items-center gap-1 transition-colors">
          <i data-lucide="upload" class="h-3 w-3"></i> Upload
        </button>
        <input type="file" multiple class="hidden" id="hidden-file-input" onchange="handleFileUpload(event)" />
      </div>
      <div class="space-y-2">
        ${state.currentAttachments.length === 0 ? '<div class="text-[12px] text-gray-500 italic p-3 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md text-center">No documents.</div>' : attHtml}
      </div>
    </div>
  `;
};

const renderDetailModal = () => {
  const app = state.editingApp;
  if (!app) return '';

  const historyHtml = app.history.map(h => `
    <div class="relative">
      <div class="absolute -left-[25px] top-1 w-3.5 h-3.5 bg-[#111] dark:bg-white border-2 border-[#111] dark:border-gray-800 rounded-full z-10"></div>
      <div class="font-bold text-[14px] leading-none mb-1 dark:text-white">${h.status}</div>
      <div class="text-[11px] text-gray-500 font-bold">${formatDate(h.date)}</div>
    </div>
  `).join('');

  const tasksHtml = (app.tasks || []).map(t => `
    <div class="flex items-start gap-2 bg-gray-50 dark:bg-[#1a1a1a] p-2 rounded-md border-2 border-transparent">
      <i data-lucide="check-square" class="h-4 w-4 shrink-0 mt-0.5 ${t.done ? 'text-gray-400' : 'text-[#111] dark:text-white'}"></i>
      <span class="font-bold ${t.done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}">${t.text}</span>
    </div>
  `).join('');

  const attHtml = (app.attachments || []).map(f => `
    <div class="flex justify-between items-center bg-gray-50 dark:bg-[#1a1a1a] rounded-md p-2 border-2 border-gray-200 dark:border-gray-800">
      <span class="flex items-center gap-2 font-bold dark:text-gray-200"><i data-lucide="file-text" class="h-4 w-4 text-gray-500"></i>${f.name}</span>
      <span class="text-[10px] text-gray-500 font-bold bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">${f.size}</span>
    </div>
  `).join('');

  return `
    <div class="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm transition-colors duration-300">
      <div class="bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-2xl w-full max-w-4xl m-auto shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] flex flex-col max-h-[90vh]">
        
        <div class="p-5 border-b-2 border-[#111] dark:border-gray-800 flex justify-between items-start bg-gray-50 dark:bg-[#1a1a1a] rounded-t-2xl shrink-0">
          <div>
            <button onclick="closeModal()" class="text-[11px] font-bold text-gray-500 hover:text-[#111] dark:hover:text-white mb-2 uppercase tracking-wider flex items-center gap-1 transition-colors"><i data-lucide="arrow-left" class="w-3 h-3"></i> Back</button>
            <div class="flex items-center gap-4 mt-1">
              <h2 class="font-bold text-[22px] m-0 leading-none dark:text-white">${app.company} <span class="text-gray-400 font-normal">—</span> ${app.role}</h2>
              <span class="border-2 border-[#111] dark:border-gray-600 rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-white dark:bg-[#0a0a0a] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] dark:text-gray-300">
                ${app.status}
              </span>
            </div>
          </div>
          <button onclick="closeModal()" class="hover:bg-gray-200 dark:hover:bg-gray-800 p-1.5 border-2 border-transparent hover:border-[#111] dark:hover:border-gray-600 rounded-md transition-all dark:text-white"><i data-lucide="x" class="h-5 w-5"></i></button>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto flex-1">
          <!-- Left Column -->
          <div class="space-y-6">
            <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] bg-white dark:bg-[#1a1a1a]">
              <h3 class="font-bold border-b-2 border-gray-100 dark:border-gray-800 pb-2 mb-4 text-[14px] dark:text-white">Information</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2"><span class="text-gray-500">Date Applied</span><span class="font-bold dark:text-gray-300">${formatDate(app.appliedDate)}</span></div>
                <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2"><span class="text-gray-500">Source</span><span class="font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md dark:text-gray-300">${app.source || '—'}</span></div>
                <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2"><span class="text-gray-500">Follow-up Date</span><span class="font-bold dark:text-gray-300">${formatDate(app.reminderDate)}</span></div>
                <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2"><span class="text-gray-500">Tags</span><span class="font-bold text-[11px] dark:text-gray-300">${app.tags || '—'}</span></div>
                <div class="flex justify-between items-center"><span class="text-gray-500">Job Link</span><span class="font-bold">${app.url ? `<a href="${app.url}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">External Link <i data-lucide="external-link" class="w-3 h-3"></i></a>` : '—'}</span></div>
              </div>
            </div>

            ${app.notes ? `
              <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 bg-yellow-50/50 dark:bg-yellow-900/10">
                <h3 class="font-bold border-b-2 border-yellow-200 dark:border-yellow-900/50 pb-2 mb-3 text-[14px] dark:text-yellow-200">Notes</h3>
                <p class="whitespace-pre-wrap font-medium text-gray-800 dark:text-gray-300 leading-relaxed">${app.notes}</p>
              </div>
            ` : ''}

            <div class="flex gap-3 pt-2">
              <button onclick="openForm(${app.id})" class="border-2 border-[#111] dark:border-gray-700 rounded-md bg-white dark:bg-[#0a0a0a] px-4 py-2 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 flex-1 text-center flex justify-center items-center gap-2 transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] dark:text-gray-300 hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"><i data-lucide="edit-2" class="w-4 h-4"></i> Edit</button>
              <button onclick="deleteApp(${app.id})" class="border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-500 bg-white dark:bg-transparent px-4 py-2 rounded-md font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-600 flex-1 text-center flex justify-center items-center gap-2 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i> Delete</button>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-[#1a1a1a]">
              <h3 class="font-bold border-b-2 border-gray-100 dark:border-gray-800 pb-2 mb-5 text-[14px] dark:text-white">Status History</h3>
              <div class="relative pl-5 border-l-2 border-[#111] dark:border-gray-600 ml-3 space-y-6">
                ${historyHtml}
                <div class="relative pt-1">
                  <div class="absolute -left-[25px] top-1.5 w-3.5 h-3.5 bg-white dark:bg-[#0a0a0a] border-2 border-dashed border-gray-400 dark:border-gray-700 rounded-full z-10"></div>
                  <div class="text-[12px] font-bold italic text-gray-400 dark:text-gray-600">Pending update...</div>
                </div>
              </div>
            </div>

            <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 bg-gray-50 dark:bg-[#0a0a0a]">
              <div class="flex justify-between items-center border-b-2 border-gray-200 dark:border-gray-800 pb-2 mb-4">
                <h3 class="font-bold text-[14px] dark:text-white">Resources</h3>
                <button onclick="generateTailoredCV(${app.id})" class="text-[11px] font-bold border-2 border-[#111] dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-[#1a1a1a] dark:text-white hover:bg-[#111] dark:hover:bg-white hover:text-white dark:hover:text-[#111] transition-colors flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]" id="btn-gen-cv-${app.id}">
                  ✨ Auto-Tailor CV
                </button>
              </div>
              
              ${app.tasks?.length > 0 ? `
                <div class="mb-5">
                  <div class="font-bold text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2"><i data-lucide="list-todo" class="w-4 h-4"></i> Tasks (${app.tasks.filter(t=>t.done).length}/${app.tasks.length})</div>
                  <div class="space-y-2">
                    ${tasksHtml}
                  </div>
                </div>
              ` : ''}

              ${app.attachments?.length > 0 ? `
                <div>
                  <div class="font-bold text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2"><i data-lucide="files" class="w-4 h-4"></i> Attachments</div>
                  <div class="space-y-2">
                    ${attHtml}
                  </div>
                </div>
              ` : `
                <div class="text-[12px] text-gray-500 dark:text-gray-600 italic p-3 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-md text-center">No resources yet. Click 'Auto-Tailor CV' or edit to upload files.</div>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};
