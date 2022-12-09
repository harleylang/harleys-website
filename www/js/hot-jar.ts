/**
 * hot-jar.ts
 * @description
 * If the origin is the production environment, then fire the hot-jar script on the page.
 */
((h, o, t, j, a, r) => {
  interface WindowWithHotJar extends Window {
    hj: {
      q: never | unknown[];
    };
    _hjSettings: {
      hjid: number;
      hjsv: number;
    };
  }

  /**
   * hotjar -- function
   * This is the installation script provided by hotjar.
   * It has been slightly modified so that it can be:
   * (1) applied on page load, and
   * (2) only deployed to production.
   */
  function hotjar(
    h: WindowWithHotJar,
    o: Document,
    t: string,
    j: string,
    a?: HTMLHeadElement,
    r?: HTMLScriptElement,
  ) {
    h.hj = h.hj ||
      function () {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
    h._hjSettings = { hjid: 3275134, hjsv: 6 };
    a = o.getElementsByTagName('head')[0];
    r = o.createElement('script');
    r.async = true;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  }

  function initialise() {
    // if the production environment, then apply the hotjar script
    if (h.location.origin === 'https://www.harleylang.com') {
      hotjar(h as never as WindowWithHotJar, o, t, j, a, r);
    }
  }

  // run the script after the initial page loads
  globalThis.addEventListener('load', initialise);
})(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
