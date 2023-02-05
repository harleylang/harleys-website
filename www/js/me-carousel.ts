const template = document.createElement('template');

template.innerHTML = `
<form name="carousel" class="me-carousel">
  <ol id="slides">
    <li id="controls" class="controls">
      <button class="button--prev" type="button"><span>&lt</span></button>
      <div id="labels" class="labels"></div>
      <button class="button--next" type="button"><span>&gt</span></button>
    </li>
  </ol>
</form>
`;

function createSlide({ index, children }: { index: number; children: string }) {
  let content: string;
  if (children.includes('<section')) content = children;
  else content = `<section>${children}</section>`;

  const slide = document.createElement('template');
  slide.innerHTML = `
    <input
      type="radio"
      id="carousel__input--${index}"
      name="radios"
      value="${index}"
      ${index === 1 ? 'checked' : ''}
    />
    <li>
      ${content}
    </li>
  `;

  const label = document.createElement('template');
  label.innerHTML = `<label for="carousel__input--${index}"></label>`;

  return { slide, label };
}

class Carousel extends HTMLElement {
  constructor() {
    super();
    // initialise variables
    const children = [...this.children];
    this.innerHTML = '';
    this.loadFonts();
    this.appendChild(template.content.cloneNode(true));
    const prev = this.querySelector('.button--prev');
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
    const next = this.querySelector('.button--next');
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
    this.setupSlides(children as unknown as NodeList);
  }

  // eslint-disable-next-line class-methods-use-this
  loadFonts() {
    const fonts = [
      'https://fonts.googleapis.com/css?family=Permanent Marker&display=swap',
      'https://fonts.googleapis.com/css2?family=Chewy&display=swap',
    ];
    const linksInHead = Array.from(document.head.children)
      .filter(
        (e) => e.nodeName === 'LINK' && !fonts.includes((e as HTMLLinkElement).href),
      )
      .map((e) => (e as HTMLLinkElement).href);

    for (let f = 0; f < fonts.length; f += 1) {
      const font = fonts[f];
      if (!linksInHead.includes(font)) {
        const link = document.createElement('link');
        link.href = font;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
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
    const nodes = [...nodeList].filter((n) => n instanceof HTMLElement);
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i] as HTMLElement;
      const metaElements = createSlide({
        index: i + 1,
        children: node.outerHTML,
      });
      const slidesNode = this.querySelector('#slides');
      const controlsNode = this.querySelector('#controls');
      if (slidesNode && controlsNode) {
        slidesNode.insertBefore(
          metaElements.slide.content.cloneNode(true),
          controlsNode,
        );
      }
      const labelsNode = this.querySelector('#labels');
      if (labelsNode) {
        labelsNode.appendChild(metaElements.label.content.cloneNode(true));
      }
    }
  }
}

window.customElements.define('me-carousel', Carousel);
