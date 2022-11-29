const template = document.createElement('template');

template.innerHTML = `
  <!--esbuild-inject-css:darkmode-toggle.css-->
  <div class="switch">
    <label for="DarkmodeToggle__input" id="DarkmodeToggle__label">
      a darkmode label
    </label>
    <input type="checkbox" id="DarkmodeToggle__input" aria-labelledby="DarkmodeToggle__label">
    <span class="slider round"></span>
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
    this.attachShadow({ mode: 'open' });
    if (this.shadowRoot !== null) {
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      const span = this.shadowRoot.querySelector('span');
      if (span) span.addEventListener('click', this.handleClick);
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', this.handleMode);
      if (localStorage.getItem('theme-mode') === 'dark') setDarkMode();
      else if (localStorage.getItem('theme-mode') === 'light') setLightMode();
      this.toggle();
    }
  }

  toggle() {
    const shadow = this.shadowRoot;
    if (shadow) {
      const input = shadow.querySelector('input');
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
  }

  handleClick = () => {
    const shadow = this.shadowRoot;
    if (shadow) {
      const input = shadow.querySelector('input');
      if (input) {
        const { checked } = input as HTMLInputElement;
        if (checked) setLightMode();
        else setDarkMode();
      }
      document.body.classList.add('background-transition');
      this.toggle();
    }
  };

  handleMode(e: MediaQueryListEvent) {
    if (e.media.includes('dark') && e.matches) setDarkMode();
    else setLightMode();
    document.body.classList.add('background-transition');
    this.toggle();
  }
}

window.customElements.define('me-darkmode-toggle', DarkModeToggle);
