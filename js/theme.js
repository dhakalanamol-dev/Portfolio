const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');


const savedTheme = localStorage.getItem('theme') || 'dark';
root.setAttribute('data-theme', savedTheme);
updateAriaLabel(savedTheme);


themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateAriaLabel(next);
});

function updateAriaLabel(theme) {
    const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggle.setAttribute('aria-label', label);
}