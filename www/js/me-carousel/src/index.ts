// eslint-disable-next-line import/no-relative-packages
import carouselBase from "../../../css/carousel.css";

const template = document.createElement("template");

template.innerHTML = `
<style>${carouselBase}</style>
<form name="carousel">
  <ol id="slides"></ol>
  <button class="button--prev" type="button">PREV</button>
  <button class="button--next" type="button">NEXT</button>
</form>
`;

function createSlide({ index, children }: { index: number; children: string }) {
  return `
    <li>
      <input
        type="radio"
        id="carousel__input--${index}"
        name="radios"
        value="${index}"
        ${index === 1 ? "checked" : ""}
      />
      <label for="carousel__input--${index}"></label>
      <section>${children}</section>
    </li>
  `;
}

class Carousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const shadow = this.shadowRoot;
    if (shadow) {
      shadow.appendChild(template.content.cloneNode(true));
      const prev = shadow.querySelector(".button--prev");
      if (prev) {
        prev.addEventListener("click", () => {
          const form = shadow.querySelector("form");
          if (form && form !== null) {
            const radioChecked = form.querySelector(
              'input[type="radio"]:checked'
            ) as HTMLInputElement;
            if (radioChecked) {
              const selected = parseInt(radioChecked.value.toString(), 10);
              const next = selected - 1;
              if (next === 0)
                form.radios[form.radios.length - 1].checked = true;
              else form.radios[next - 1].checked = true;
            }
          }
        });
      }
      const next = shadow.querySelector(".button--next");
      if (next) {
        next.addEventListener("click", () => {
          const form = shadow.querySelector("form");
          if (form && form !== null) {
            const radioChecked = form.querySelector(
              'input[type="radio"]:checked'
            ) as HTMLInputElement;
            if (radioChecked) {
              const selected = parseInt(radioChecked.value.toString(), 10);
              const nextone = selected + 1;
              if (nextone === form.radios.length + 1)
                form.radios[0].checked = true;
              else form.radios[nextone - 1].checked = true;
            }
          }
        });
      }
    }
  }

  connectedCallback() {
    // observer element mutations
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) this.setupSlides(mutation.addedNodes);
      });
    });
    observer.observe(this, { childList: true });
  }

  setupSlides(nodeList: NodeList) {
    // eslint-disable-next-line no-var
    var slides = "";
    const nodes = [...nodeList].filter((n) => n instanceof HTMLElement);
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i] as HTMLElement;
      const newSlide = createSlide({ index: i + 1, children: node.outerHTML });
      slides = `${slides}${newSlide}`;
    }
    const shadow = this.shadowRoot;
    if (shadow) {
      const slidesNode = shadow.querySelector("#slides");
      if (slidesNode) {
        slidesNode.innerHTML = slides;
      }
    }
  }
}

window.customElements.define("me-carousel", Carousel);
