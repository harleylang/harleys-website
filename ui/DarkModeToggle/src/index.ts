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
      const span = this.shadowRoot.querySelector("span");
      if (span) span.addEventListener("click", this.handleClick);
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", this.handleMode);
      if (localStorage.getItem("theme-mode") === "dark") this.setDarkMode();
      else if (localStorage.getItem("theme-mode") === "light")
        this.setLightMode();
      this.toggle();
    }
  }

  toggle = () => {
    const shadow = this.shadowRoot;
    if (shadow) {
      const input = shadow.querySelector("input");
      if (input) {
        const prefersDarkMode =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        const overrideDarkMode =
          document.body.classList.contains("dark-mode") ||
          localStorage.getItem("theme-mode") === "dark";
        const overrideLightMode =
          document.body.classList.contains("light-mode") ||
          localStorage.getItem("theme-mode") === "light";
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
  };

  setLightMode = () => {
    localStorage.setItem("theme-mode", "light");
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
  };

  setDarkMode = () => {
    localStorage.setItem("theme-mode", "dark");
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
  };

  handleClick = () => {
    const shadow = this.shadowRoot;
    if (shadow) {
      const input = shadow.querySelector("input");
      if (input) {
        const checked = (input as HTMLInputElement).checked;
        if (checked) this.setLightMode();
        else this.setDarkMode();
      }
      document.body.classList.add("background-transition");
      this.toggle();
    }
  };

  handleMode = (e: any) => {
    if (e.media.includes("dark") && e.matches) this.setDarkMode();
    else this.setLightMode();
    document.body.classList.add("background-transition");
    this.toggle();
  };
}

window.customElements.define("me-darkmode-toggle", Button);
