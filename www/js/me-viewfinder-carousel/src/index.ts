// eslint-disable-next-line import/no-relative-packages
import carouselBase from "../../../css/carousel.css";

const template = document.createElement("template");

template.innerHTML = `
<style>${carouselBase}</style>
<form name="carousel">
  <ol>
    <li>
      <input
        type="radio"
        id="carousel__input--1"
        name="radios"
        value="1"
        checked
      />
      <label for="carousel__input--1"></label>
      <section>
        <img
          src="https://dribbble.s3.amazonaws.com/users/322/screenshots/872485/coldchase.jpg"
          alt="image 1"
        />
      </section>
    </li>
    <li>
      <input type="radio" id="carousel__input--2" name="radios" value="2" />
      <label for="carousel__input--2"></label>
      <section>
        <img
          src="https://dribbble.s3.amazonaws.com/users/322/screenshots/980517/icehut_sm.jpg"
          alt="image 2"
        />
      </section>
    </li>
    <li>
      <input type="radio" id="carousel__input--3" name="radios" value="3" />
      <label for="carousel__input--3"></label>
      <section>
        <img
          src="https://dribbble.s3.amazonaws.com/users/322/screenshots/943660/hq_sm.jpg"
          alt="image 3"
        />
      </section>
    </li>

    <li>
      <input type="radio" id="carousel__input--4" name="radios" value="4" />
      <label for="carousel__input--4"></label>
      <section>
        <img
          src="https://dribbble.s3.amazonaws.com/users/322/screenshots/599584/home.jpg"
          alt="image 4"
        />
      </section>
    </li>
  </ol>
  <button class="button--prev" type="button">PREV</button>
  <button class="button--next" type="button">NEXT</button>
</form>
`;

class ViewFinderCarousel extends HTMLElement {
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
}

window.customElements.define("me-viewfinder-carousel", ViewFinderCarousel);
