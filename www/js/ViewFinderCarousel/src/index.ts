// import css from "./index.css";

const template = document.createElement("template");

template.innerHTML = `
  <div>
    testing
  </div>
`;

class ViewFinderCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const shadow = this.shadowRoot;
    if (shadow) {
      shadow.appendChild(template.content.cloneNode(true));
    }
  }
}

window.customElements.define("me-viewfinder-carousel", ViewFinderCarousel);
