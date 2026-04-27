const render = () => {
  const root = document.getElementById('root');
  if (!state.isAuthenticated) {
    root.innerHTML = renderAuth();
  } else {
    root.innerHTML = renderApp();
  }
  lucide.createIcons();
};

const renderApp = () => {
  const unreadNotifs = state.notifications.filter(n => n.unread).length;
  
  return `
    <div class="flex h-screen overflow-hidden bg-gray-100 dark:bg-[#0a0a0a] transition-colors duration-300">
      
      <aside class="${state.isSidebarOpen ? 'w-48' : 'w-0'} shrink-0 flex flex-col transition-all duration-300 bg-transparent overflow-hidden whitespace-nowrap z-20">
        <div class="p-2 md:p-3 flex flex-col h-full w-48">
          <div class="font-bold text-[18px] tracking-widest mb-6 px-2 mt-2 dark:text-white">
            Applyr
          </div>
          <nav class="flex flex-col gap-1 flex-1">
            ${['Dashboard', 'Applications', 'Resumes', 'Notifications', 'Profile'].map(tab => `
              <button 
                onclick="setActiveTab('${tab}')"
                class="text-left py-2 px-3 rounded-lg border-2 hover:bg-white dark:hover:bg-gray-800 flex justify-between items-center transition-all ${state.activeTab === tab ? 'font-bold border-[#111] dark:border-gray-500 bg-white dark:bg-[#111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] dark:text-white' : 'border-transparent dark:text-gray-400'}"
              >
                <span>${tab}</span>
                ${tab === 'Notifications' && unreadNotifs > 0 ? `<span class="bg-[#111] dark:bg-white text-white dark:text-[#111] text-[10px] px-1.5 py-0.5 leading-none font-bold rounded-sm">${unreadNotifs}</span>` : ''}
              </button>
            `).join('')}
          </nav>
          
          <button onclick="toggleTheme()" class="mt-auto mb-4 mx-2 p-2 rounded-lg border-2 border-transparent hover:border-[#111] dark:hover:border-gray-700 flex items-center gap-3 transition-all dark:text-gray-400">
            <i data-lucide="${state.theme === 'light' ? 'moon' : 'sun'}" class="w-4 h-4"></i>
            <span class="text-[11px] font-bold uppercase tracking-wider">${state.theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </aside>

      <div class="flex-1 flex flex-col h-screen overflow-hidden relative p-2 md:p-3 ${state.isSidebarOpen ? 'pl-0 md:pl-0' : ''} transition-all duration-300">
        <div class="bg-white dark:bg-[#111] rounded-2xl border-2 border-[#111] dark:border-gray-800 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] h-full flex flex-col overflow-hidden relative z-0 transition-colors">
           <header class="p-3 px-5 flex justify-between items-center shrink-0 bg-white dark:bg-[#111] z-10 border-b-2 border-gray-100 dark:border-gray-800 transition-colors">
            <div class="flex items-center gap-4">
              <button onclick="toggleSidebar()" class="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 border-2 border-transparent hover:border-[#111] dark:hover:border-gray-600 rounded-md transition-all dark:text-white">
                <i data-lucide="menu" class="w-5 h-5"></i>
              </button>
              <div class="font-bold tracking-widest dark:text-white ${state.isSidebarOpen ? 'opacity-0 hidden md:block' : 'opacity-100'} transition-opacity">Applyr</div>
            </div>
            <div class="text-[12px] flex items-center gap-4">
              <button onclick="setActiveTab('Profile')" class="hover:underline font-bold flex items-center gap-1.5 dark:text-gray-300"><i data-lucide="user" class="w-4 h-4"></i> Profile</button>
              <span class="text-gray-300 dark:text-gray-700">|</span>
              <button onclick="logout()" class="hover:underline text-red-600 font-bold">Logout</button>
            </div>
          </header>
          <div class="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            ${state.activeTab === 'Dashboard' ? renderDashboard() : ''}
            ${state.activeTab === 'Applications' ? renderCandidatures() : ''}
            ${state.activeTab === 'Resumes' ? renderResumes() : ''}
            ${state.activeTab === 'Notifications' ? renderNotifications() : ''}
            ${state.activeTab === 'Profile' ? renderProfile() : ''}
          </div>
        </div>
      </div>

        ${state.modalMode === 'form' ? renderFormModal() : ''}
        ${state.modalMode === 'detail' ? renderDetailModal() : ''}
    </div>
  `;
};

// Handlers
window.toggleSidebar = () => {
  state.isSidebarOpen = !state.isSidebarOpen;
  render();
};

window.toggleAuthMode = () => {
  state.authMode = state.authMode === 'login' ? 'register' : 'login';
  render();
};

window.handleAuth = (e) => {
  e.preventDefault();
  state.isAuthenticated = true;
  render();
};

window.logout = () => {
  state.isAuthenticated = false;
  render();
};

window.setActiveTab = (tab) => {
  state.activeTab = tab;
  render();
};

window.handleSearch = (e) => {
  state.searchQuery = e.target.value;
  render();
};

window.handleFilter = (e) => {
  state.statusFilter = e.target.value;
  render();
};

window.handleViewMode = (mode) => {
  state.viewMode = mode;
  render();
};

window.openForm = (appId = null) => {
  const app = appId ? state.applications.find(a => a.id === appId) : null;
  state.editingApp = app;
  state.currentAttachments = app ? [...app.attachments] : [];
  state.currentTasks = app ? JSON.parse(JSON.stringify(app.tasks || [])) : [];
  state.formStatus = app ? app.status : 'Wishlist';
  state.modalMode = 'form';
  render();
};

window.openDetail = (appId) => {
  state.editingApp = state.applications.find(a => a.id === appId);
  state.modalMode = 'detail';
  render();
};

window.closeModal = () => {
  state.modalMode = null;
  state.editingApp = null;
  render();
};

window.deleteApp = (appId) => {
  if(confirm('Delete this application permanently?')) {
    state.applications = state.applications.filter(a => a.id !== appId);
    state.modalMode = null;
    render();
  }
};

window.handleFormStatusChange = (e) => {
  const newStatus = e.target.value;
  state.formStatus = newStatus;
  
  if (newStatus === 'Interview' && state.currentTasks.length === 0) {
    state.currentTasks = JSON.parse(JSON.stringify(DEFAULT_INTERVIEW_TASKS));
    updateFormResourcesDOM();
  }
};

window.handleGlobalUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        alert(`Uploaded ${file.name}. AI is extracting text...`);
        setTimeout(() => {
            state.globalCV = "Extracted text from " + file.name + ":\n\nExperienced Software Engineer with a background in building scalable web applications using Laravel, React, and Node.js. Strong focus on backend architecture, API design, and performance optimization. Passionate about clean code and agile methodologies.";
            render();
        }, 1000);
    }
};

window.saveGlobalCV = () => {
    const input = document.getElementById('global-cv-input');
    if(input) {
        state.globalCV = input.value;
        alert('Global CV Profile saved!');
    }
};

window.generateTailoredCV = (appId) => {
    const btn = document.getElementById(`btn-gen-cv-${appId}`);
    if(btn) {
        btn.innerText = 'Generating...';
        btn.disabled = true;
    }

    setTimeout(() => {
        const app = state.applications.find(a => a.id === appId);
        if(app) {
            app.attachments = app.attachments || [];
            const safeCompanyName = app.company.replace(/\s+/g, '_');
            const fileName = `Tailored_CV_${safeCompanyName}.pdf`;
            app.attachments.push({
                id: Date.now(),
                name: fileName,
                size: '1.4 MB'
            });
            state.generatedResumes.unshift({
                id: Date.now(),
                company: app.company,
                date: new Date().toISOString().split('T')[0],
                name: fileName
            });
        }
        render();
    }, 1500);
};

window.saveApp = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const today = new Date().toISOString().split('T')[0];

  const appData = {
    company: fd.get('company'),
    role: fd.get('role'),
    status: state.formStatus,
    appliedDate: fd.get('appliedDate'),
    url: fd.get('url'),
    source: fd.get('source'),
    reminderDate: fd.get('reminderDate'),
    tags: fd.get('tags'),
    notes: fd.get('notes'),
    attachments: [...state.currentAttachments],
    tasks: [...state.currentTasks]
  };

  if (state.editingApp) {
    let history = [...state.editingApp.history];
    if (state.editingApp.status !== state.formStatus) {
      history.push({ status: state.formStatus, date: today });
    }
    state.applications = state.applications.map(a => 
      a.id === state.editingApp.id ? { ...a, ...appData, history } : a
    );
  } else {
    state.applications.push({
      id: Date.now(),
      ...appData,
      history: [{ status: state.formStatus, date: today }]
    });
  }

  state.modalMode = null;
  render();
};

const updateFormResourcesDOM = () => {
  const container = document.getElementById('form-resources');
  if (container) {
    container.innerHTML = renderFormResources();
    lucide.createIcons({ root: container });
  }
};

window.addTask = () => {
  state.currentTasks.push({ id: Date.now(), text: 'New task', done: false });
  updateFormResourcesDOM();
};

window.toggleTask = (id) => {
  const task = state.currentTasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  updateFormResourcesDOM();
};

window.updateTaskText = (id, e) => {
  const task = state.currentTasks.find(t => t.id === id);
  if (task) task.text = e.target.value;
};

window.removeTask = (id) => {
  state.currentTasks = state.currentTasks.filter(t => t.id !== id);
  updateFormResourcesDOM();
};

window.triggerFileUpload = () => {
  document.getElementById('hidden-file-input').click();
};

window.handleFileUpload = (e) => {
  const files = Array.from(e.target.files);
  const newAttachments = files.map(file => ({
    id: Date.now() + Math.random(),
    name: file.name,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
  }));
  state.currentAttachments = [...state.currentAttachments, ...newAttachments];
  updateFormResourcesDOM();
};

window.removeAttachment = (id) => {
  state.currentAttachments = state.currentAttachments.filter(a => a.id !== id);
  updateFormResourcesDOM();
};

window.handleDragStart = (e, id) => {
  e.dataTransfer.setData('appId', id);
  e.target.style.opacity = '0.4';
};

window.handleDragEnd = (e) => {
  e.target.style.opacity = '1';
};

window.handleDragOver = (e) => {
  e.preventDefault();
};

window.handleDrop = (e, newStatus) => {
  e.preventDefault();
  const appId = parseInt(e.dataTransfer.getData('appId'));
  if (appId) {
    const today = new Date().toISOString().split('T')[0];
    
    state.applications = state.applications.map(app => {
      if (app.id === appId && app.status !== newStatus) {
        const tasks = (newStatus === 'Interview' && (!app.tasks || app.tasks.length === 0)) 
                      ? JSON.parse(JSON.stringify(DEFAULT_INTERVIEW_TASKS)) 
                      : app.tasks;
        return { 
          ...app, 
          status: newStatus, 
          tasks, 
          history: [...app.history, { status: newStatus, date: today }] 
        };
      }
      return app;
    });
    render();
  }
};

window.markAsRead = (id) => {
  const notif = state.notifications.find(n => n.id === id);
  if (notif) notif.unread = false;
  render();
};

window.markAllAsRead = () => {
  state.notifications.forEach(n => n.unread = false);
  render();
};

document.addEventListener('DOMContentLoaded', () => {
  render();
});
