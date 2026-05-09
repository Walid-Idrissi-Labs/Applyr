const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return dateStr.split('-').reverse().join('/');
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '—';
  return dateStr.split('-').slice(1).reverse().join('/');
};

const applyTheme = () => {
    if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', state.theme);
};

window.toggleTheme = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    render();
};

// Initial apply
applyTheme();
