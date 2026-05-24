(function () {
  'use strict';

  const STORAGE_KEY_AUTH = 'applyr_auth';
  const STORAGE_KEY_THEME = 'applyr_theme';
  const REGISTER_URL = 'http://localhost:5173/register';

  let currentUser = null;
  let isDark = false;
  let handlersInitialized = false;

  const els = {
    loginView: document.getElementById('login-view'),
    mainView: document.getElementById('main-view'),
    loginForm: document.getElementById('login-form'),
    linkRegister: document.getElementById('link-register'),
    logoutBtn: document.getElementById('logout-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    themeToggleLogin: document.getElementById('theme-toggle-login'),
    moonIcon: document.getElementById('moon-icon'),
    sunIcon: document.getElementById('sun-icon'),
    moonIconLogin: document.getElementById('moon-icon-login'),
    sunIconLogin: document.getElementById('sun-icon-login'),
    appForm: document.getElementById('application-form'),
    btnCancel: document.getElementById('btn-cancel'),
    toast: document.getElementById('toast'),
    stats: {
      total: document.getElementById('stat-total'),
      progress: document.getElementById('stat-progress'),
      rejected: document.getElementById('stat-rejected'),
      accepted: document.getElementById('stat-accepted'),
    },
    inputs: {
      company: document.getElementById('company'),
      position: document.getElementById('position'),
      status: document.getElementById('status'),
      appliedDate: document.getElementById('applied-date'),
      link: document.getElementById('link'),
      source: document.getElementById('source'),
      reminderDate: document.getElementById('reminder-date'),
      notes: document.getElementById('notes'),
      tags: document.getElementById('tags'),
    },
  };

  function showToast(message, duration = 2200) {
    els.toast.textContent = message;
    els.toast.classList.remove('hidden');
    setTimeout(() => els.toast.classList.add('hidden'), duration);
  }

  function loadAuth() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      if (raw) {
        const auth = JSON.parse(raw);
        return auth;
      }
    } catch (e) {}
    return null;
  }

  function saveAuth(authData) {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authData));
  }

  function clearAuth() {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    currentUser = null;
  }

  function loadTheme() {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved) {
      isDark = saved === 'dark';
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme();
  }

  function saveTheme() {
    localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    const moonHidden = isDark;
    els.moonIcon.classList.toggle('hidden', moonHidden);
    els.sunIcon.classList.toggle('hidden', !moonHidden);
    els.moonIconLogin.classList.toggle('hidden', moonHidden);
    els.sunIconLogin.classList.toggle('hidden', !isDark);
  }

  function toggleTheme() {
    isDark = !isDark;
    applyTheme();
    saveTheme();
  }

  function renderAuth() {
    const auth = loadAuth();
    if (auth && auth.token && auth.user) {
      currentUser = auth.user;
      els.loginView.classList.add('hidden');
      els.mainView.classList.remove('hidden');
      renderStats();
    } else {
      els.loginView.classList.remove('hidden');
      els.mainView.classList.add('hidden');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      showToast('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.email?.[0] || 'Login failed');
      }

      saveAuth({ token: data.token, user: data.user });
      currentUser = data.user;
      showToast('Signed in successfully');
      renderAuth();
      resetForm();
    } catch (error) {
      showToast(error.message || 'Login failed');
    }
  }

  async function handleLogout() {
    const auth = loadAuth();
    if (auth && auth.token) {
      try {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`,
          },
        });
      } catch (e) {}
    }
    clearAuth();
    showToast('Signed out');
    renderAuth();
  }

  function goRegister(e) {
    e.preventDefault();
    window.open(REGISTER_URL, '_blank');
  }

  async function fetchDashboard() {
    const auth = loadAuth();
    if (!auth || !auth.token) return null;

    try {
      const response = await fetch('http://localhost:8000/api/applications/dashboard', {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
          renderAuth();
          return null;
        }
        throw new Error('Failed to fetch dashboard');
      }

      return await response.json();
    } catch (e) {
      return null;
    }
  }

  async function renderStats() {
    const dashboard = await fetchDashboard();
    if (dashboard) {
      els.stats.total.textContent = dashboard.total || 0;
      els.stats.progress.textContent = (dashboard.status_counts?.applied || 0) +
        (dashboard.status_counts?.interview || 0) +
        (dashboard.status_counts?.['technical test'] || 0) +
        (dashboard.status_counts?.offer || 0);
      els.stats.rejected.textContent = dashboard.status_counts?.rejected || 0;
      els.stats.accepted.textContent = dashboard.status_counts?.accepted || 0;
    } else {
      els.stats.total.textContent = '0';
      els.stats.progress.textContent = '0';
      els.stats.rejected.textContent = '0';
      els.stats.accepted.textContent = '0';
    }
  }

  async function handleAddApplication(e) {
    e.preventDefault();

    const auth = loadAuth();
    if (!auth || !auth.token) {
      showToast('Please sign in first');
      return;
    }

    const company = els.inputs.company.value.trim();
    const position = els.inputs.position.value.trim();
    if (!company || !position) {
      showToast('Company and Position are required');
      return;
    }

    const tagsInput = els.inputs.tags.value.trim();
    if (tagsInput) {
      showToast('Tags are managed in the web app');
    }

    try {
      const response = await fetch('http://localhost:8000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          company_name: company,
          position: position,
          status: els.inputs.status.value,
          applied_at: els.inputs.appliedDate.value || null,
          link: els.inputs.link.value.trim() || null,
          source: els.inputs.source.value.trim() || null,
          reminder_date: els.inputs.reminderDate.value || null,
          notes: els.inputs.notes.value.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add application');
      }

      resetForm();
      renderStats();
      showToast('Application added successfully');
    } catch (error) {
      showToast(error.message || 'Failed to add application');
    }
  }

  function resetForm() {
    els.appForm.reset();
    els.inputs.appliedDate.valueAsDate = new Date();
    els.inputs.status.value = 'Applied';
  }

  function initEventListeners() {
    if (handlersInitialized) return;
    handlersInitialized = true;

    els.loginForm.addEventListener('submit', handleLogin);
    els.linkRegister.addEventListener('click', goRegister);
    els.logoutBtn.addEventListener('click', handleLogout);
    els.themeToggle.addEventListener('click', toggleTheme);
    els.themeToggleLogin.addEventListener('click', toggleTheme);
    els.appForm.addEventListener('submit', handleAddApplication);
    els.btnCancel.addEventListener('click', resetForm);
  }

  function init() {
    loadTheme();
    renderAuth();
    initEventListeners();

    if (!els.inputs.appliedDate.value) {
      els.inputs.appliedDate.valueAsDate = new Date();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();