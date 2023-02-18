const template = document.createElement('template');

template.innerHTML = `
  <form class="me-carousel" name="carousel">
    <ol class="me-carousel__slides">
      <li class="me-carousel__controls">
        <button 
          class="me-carousel__control-button me-carousel__control-button--prev" 
          type="button">
          <span class="me-carousel__control-button-text">&lt</span>
        </button>
        <div class="me-carousel__control-dots"></div>
        <button 
          class="me-carousel__control-button me-carousel__control-button--next" 
          type="button">
          <span class="me-carousel__control-button-text">&gt</span>
        </button>
      </li>
    </ol>
  </form>
`;

function createSlide({ index, children }: { index: number; children: string }) {
  let content: string;
  if (children.includes('<section')) content = children;
  else content = `<section class="me-carousel__slide-content">${children}</section>`;

  const slide = document.createElement('template');
  slide.innerHTML = `
    <input
      class="me-carousel__input me-carousel__input--${index}"
      id="me-carousel__input--${index}"
      value="${index}"
      name="radios"
      type="radio"
      ${index === 1 ? 'checked' : ''}
    />
    <li class="me-carousel__slide">
      ${content}
    </li>
  `;

  const label = document.createElement('template');
  label.innerHTML = `<label 
      class="me-carousel__control-dot me-carousel__control-dot--${index}" 
      for="me-carousel__input--${index}"></label>`;

  return { slide, label };
}

class Carousel extends HTMLElement {
  #children: Element[] = [];

  constructor() {
    super();
    // initialise variables
    this.#children = [...this.children];
    this.innerHTML = '';
    this.appendChild(template.content.cloneNode(true));
    const prev = this.querySelector('.me-carousel__control-button--prev');
    if (prev) {
      prev.addEventListener('touchend', (event: Event) => {
        event.preventDefault(); // prevent mobile dbl tap zoom
        const form = this.querySelector('form');
        if (form && form !== null) {
          const radioChecked = form.querySelector(
            'input[type="radio"][name="radios"]:checked',
          ) as HTMLInputElement;
          if (radioChecked) {
            const selected = parseInt(radioChecked.value.toString(), 10);
            const radios = Array.from(form.elements).filter((e) => {
              const element = e as HTMLElement & { name?: string };
              return (
                typeof element.name !== 'undefined' &&
                element.name === 'radios'
              );
            }) as HTMLInputElement[];
            const next = selected - 1;
            if (next === 0) radios[radios.length - 1].checked = true;
            else radios[next - 1].checked = true;
          }
        }
      });
      prev.addEventListener('click', () => {
        const form = this.querySelector('form');
        if (form && form !== null) {
          const radioChecked = form.querySelector(
            'input[type="radio"][name="radios"]:checked',
          ) as HTMLInputElement;
          if (radioChecked) {
            const selected = parseInt(radioChecked.value.toString(), 10);
            const next = selected - 1;
            if (next === 0) {
              form.radios[form.radios.length - 1].checked = true;
            } else form.radios[next - 1].checked = true;
          }
        }
      });
    }
    const next = this.querySelector('.me-carousel__control-button--next');
    if (next) {
      next.addEventListener('touchend', (event: Event) => {
        event.preventDefault(); // prevent mobile dbl tap zoom
        const form = this.querySelector('form');
        if (form && form !== null) {
          const radioChecked = form.querySelector(
            'input[type="radio"][name="radios"]:checked',
          ) as HTMLInputElement;
          if (radioChecked) {
            const selected = parseInt(radioChecked.value.toString(), 10);
            const nextone = selected + 1;
            const radios = Array.from(form.elements).filter((e) => {
              const element = e as HTMLElement & { name?: string };
              return (
                typeof element.name !== 'undefined' &&
                element.name === 'radios'
              );
            }) as HTMLInputElement[];
            if (nextone === radios.length + 1) radios[0].checked = true;
            else radios[nextone - 1].checked = true;
          }
        }
      });
      next.addEventListener('click', () => {
        const form = this.querySelector('form');
        if (form && form !== null) {
          const radioChecked = form.querySelector(
            'input[type="radio"][name="radios"]:checked',
          ) as HTMLInputElement;
          if (radioChecked) {
            const selected = parseInt(radioChecked.value.toString(), 10);
            const nextone = selected + 1;
            if (nextone === form.radios.length + 1) {
              form.radios[0].checked = true;
            } else form.radios[nextone - 1].checked = true;
          }
        }
      });
    }
    // setup initial children
    this.setupSlides(this.#children as never as NodeList);
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
    const nodes = [...nodeList].filter((n) => n instanceof HTMLElement);
    for (let i = 0; i < nodes.length; i += 1) {
      // derive slide content and dots from template
      const node = nodes[i] as HTMLElement;
      const metaElements = createSlide({
        index: i + 1,
        children: node.outerHTML,
      });
      // append slide content
      const slidesNode = this.querySelector('.me-carousel__slides');
      const controlsNode = this.querySelector('.me-carousel__controls');
      if (slidesNode && controlsNode) {
        slidesNode.insertBefore(
          metaElements.slide.content.cloneNode(true),
          controlsNode,
        );
      }
      // append dots
      const labelsNode = this.querySelector('.me-carousel__control-dots');
      if (labelsNode) {
        labelsNode.appendChild(metaElements.label.content.cloneNode(true));
      }
    }
  }
}

window.customElements.define('me-carousel', Carousel);
