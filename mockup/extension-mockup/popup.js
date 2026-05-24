(function () {
  'use strict';

  // ==========================
  // STATE & CONFIG
  // ==========================
  const STORAGE_KEY_APPS = 'applyr_apps';
  const STORAGE_KEY_USER = 'applyr_user';
  const STORAGE_KEY_THEME = 'applyr_theme';

  // Replace with your actual web app registration URL
  const REGISTER_URL = 'https://applyr.app/register';

  let apps = [];
  let currentUser = null;
  let isDark = false;

  // ==========================
  // DOM ELEMENTS
  // ==========================
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

  // ==========================
  // UTILITIES
  // ==========================
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function showToast(message, duration = 2200) {
    els.toast.textContent = message;
    els.toast.classList.remove('hidden');
    setTimeout(() => els.toast.classList.add('hidden'), duration);
  }

  // ==========================
  // STORAGE
  // ==========================
  function loadApps() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_APPS);
      apps = raw ? JSON.parse(raw) : [];
    } catch (e) {
      apps = [];
    }
  }

  function saveApps() {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
  }

  function loadUser() {
    try {
      currentUser = localStorage.getItem(STORAGE_KEY_USER);
    } catch (e) {
      currentUser = null;
    }
  }

  function saveUser(email) {
    currentUser = email;
    localStorage.setItem(STORAGE_KEY_USER, email);
  }

  function clearUser() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY_USER);
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
    els.sunIconLogin.classList.toggle('hidden', !moonHidden);
  }

  function toggleTheme() {
    isDark = !isDark;
    applyTheme();
    saveTheme();
  }

  // ==========================
  // AUTH & VIEWS
  // ==========================
  function renderAuth() {
    if (currentUser) {
      els.loginView.classList.add('hidden');
      els.mainView.classList.remove('hidden');
      renderStats();
    } else {
      els.loginView.classList.remove('hidden');
      els.mainView.classList.add('hidden');
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      showToast('Please fill in all fields');
      return;
    }

    // Mock authentication — in production, call your API
    saveUser(email);
    showToast('Signed in successfully');
    renderAuth();
  }

  function handleLogout() {
    clearUser();
    showToast('Signed out');
    renderAuth();
  }

  function goRegister(e) {
    e.preventDefault();
    window.open(REGISTER_URL, '_blank');
  }

  // ==========================
  // STATS
  // ==========================
  function calculateStats() {
    const total = apps.length;
    const inProgress = apps.filter(a =>
      ['Applied', 'Interview', 'Technical Test', 'Offer'].includes(a.status)
    ).length;
    const rejected = apps.filter(a => a.status === 'Rejected').length;
    const accepted = apps.filter(a => a.status === 'Accepted').length;
    return { total, inProgress, rejected, accepted };
  }

  function renderStats() {
    const s = calculateStats();
    els.stats.total.textContent = s.total;
    els.stats.progress.textContent = s.inProgress;
    els.stats.rejected.textContent = s.rejected;
    els.stats.accepted.textContent = s.accepted;
  }

  // ==========================
  // APPLICATIONS
  // ==========================
  function handleAddApplication(e) {
    e.preventDefault();

    const company = els.inputs.company.value.trim();
    const position = els.inputs.position.value.trim();
    if (!company || !position) {
      showToast('Company and Position are required');
      return;
    }

    const newApp = {
      id: generateId(),
      company,
      position,
      status: els.inputs.status.value,
      appliedDate: els.inputs.appliedDate.value,
      link: els.inputs.link.value.trim(),
      source: els.inputs.source.value.trim(),
      reminderDate: els.inputs.reminderDate.value,
      notes: els.inputs.notes.value.trim(),
      tags: els.inputs.tags.value.trim(),
      createdAt: Date.now(),
    };

    apps.push(newApp);
    saveApps();

    resetForm();
    renderStats();
    showToast('Application added successfully');
  }

  function resetForm() {
    els.appForm.reset();
    els.inputs.appliedDate.valueAsDate = new Date();
  }

  // ==========================
  // INIT
  // ==========================
  function init() {
    loadTheme();
    loadApps();
    loadUser();
    renderAuth();

    if (!els.inputs.appliedDate.value) {
      els.inputs.appliedDate.valueAsDate = new Date();
    }

    els.loginForm.addEventListener('submit', handleLogin);
    els.linkRegister.addEventListener('click', goRegister);
    els.logoutBtn.addEventListener('click', handleLogout);
    els.themeToggle.addEventListener('click', toggleTheme);
    els.themeToggleLogin.addEventListener('click', toggleTheme);
    els.appForm.addEventListener('submit', handleAddApplication);
    els.btnCancel.addEventListener('click', resetForm);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
