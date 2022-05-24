import css from "./index.css";

const template = document.createElement("template");

template.innerHTML = `
  <style>${css}</style>

  <div class="switch">
  <label for="DarkmodeToggle__input" id="DarkmodeToggle__label">
    a darkmode label
  </label>
    <input type="checkbox" id="DarkmodeToggle__input" aria-labelledby="DarkmodeToggle__label">
    <span class="slider round"></span>
  </div>
`;

class Button extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    if (this.shadowRoot !== null) {
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      const input = this.shadowRoot.querySelector("input");
      if (input) input.addEventListener('click', this.handleClick);
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', this.handleMode);
      document.body.addEventListener('change', () => console.log('HERE'))
    }
  }

  toggle = () => {
    const shadow = this.shadowRoot;
    if (shadow) {
      const input = shadow.querySelector("input");
      if (input) {
        const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const overrideDarkMode = document.body.classList.contains('dark-mode');
        const overrideLightMode = document.body.classList.contains('light-mode');
        switch(true) {
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
  };

  handleClick = ({ currentTarget: input }: MouseEvent) => {
    if (input) {
      const checked = (input as HTMLInputElement).checked;
      if (checked) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      };
    };
    this.toggle();
  };

  handleMode = () => this.toggle();

}

window.customElements.define("me-darkmode-toggle", Button);
