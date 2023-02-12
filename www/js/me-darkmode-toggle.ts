const template = document.createElement('template');

template.innerHTML = `
  <div class="me-darkmode-toggle">
    <div class="me-darkmode-toggle__inner-wrapper">
      <label 
        for="me-darkmode-toggle__input" 
        id="me-darkmode-toggle__label"
        class="me-darkmode-toggle__label">
        a darkmode label
      </label>
      <input 
        id="me-darkmode-toggle__input" 
        class="me-darkmode-toggle__input"
        type="checkbox" 
        aria-labelledby="me-darkmode-toggle__label">
      <span class="me-darkmode-toggle__slider me-darkmode-toggle__slider--round"></span>
    </div>
  </div>
`;

function setLightMode() {
  localStorage.setItem('theme-mode', 'light');
  document.body.classList.add('light-mode');
  document.body.classList.remove('dark-mode');
}

function setDarkMode() {
  localStorage.setItem('theme-mode', 'dark');
  document.body.classList.add('dark-mode');
  document.body.classList.remove('light-mode');
}

class DarkModeToggle extends HTMLElement {
  constructor() {
    super();
    this.appendChild(template.content.cloneNode(true));
    const span = this.querySelector('span');
    if (span) span.addEventListener('click', this.handleClick);
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', this.handleMode);
    if (localStorage.getItem('theme-mode') === 'dark') setDarkMode();
    else if (localStorage.getItem('theme-mode') === 'light') setLightMode();
    this.toggle();
  }

  toggle() {
    const input = this.querySelector('input');
    if (input) {
      const prefersDarkMode = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const overrideDarkMode = document.body.classList.contains('dark-mode') ||
        localStorage.getItem('theme-mode') === 'dark';
      const overrideLightMode = document.body.classList.contains('light-mode') ||
        localStorage.getItem('theme-mode') === 'light';
      switch (true) {
        case overrideDarkMode:
          input.checked = true;
          break;
        case overrideLightMode:
          input.checked = false;
          break;
        case prefersDarkMode:
          input.checked = true;
          break;
        default:
          input.checked = false;
          break;
      }
    }
  }

  handleClick = () => {
    const input = this.querySelector('input');
    if (input) {
      const { checked } = input as HTMLInputElement;
      if (checked) setLightMode();
      else setDarkMode();
    }
    document.body.classList.add('background-transition');
    this.toggle();
  };

  handleMode(e: MediaQueryListEvent) {
    if (e.media.includes('dark') && e.matches) setDarkMode();
    else setLightMode();
    document.body.classList.add('background-transition');
    this.toggle();
  }
}

window.customElements.define('me-darkmode-toggle', DarkModeToggle);
