/**
 * hyperlink-precache.mjs
 * @description
 * Looks for anchor tags with the attribute `precache`.
 * Each matching anchor tag's href is fetched. Then, the received
 * HTML is traversed for images, scripts, and styles to precache.
 * @see
 * Influenced by:
 * - https://addyosmani.com/blog/prefetching/
 * - https://github.com/dieulot/instantclick
 * - https://github.com/GoogleChromeLabs/quicklink/
 */

(() => {
  function cacheImgs(doc: Document) {
    const imgs = doc.querySelectorAll("img");
    for (let i = 0; i < imgs.length; i += 1) {
      const img = imgs[i];
      new Image().src = img.getAttribute("src") ?? "";
    }
  }

  function cacheScripts(doc: Document) {
    const scripts = doc.querySelectorAll("script");
    for (let i = 0; i < scripts.length; i += 1) {
      const script = scripts[i];
      const preloadLink = document.createElement("link");
      preloadLink.href = script.src;
      preloadLink.rel = "preload";
      preloadLink.as = "script";
      document.head.appendChild(preloadLink);
    }
  }

  function cacheLinks(doc: Document) {
    const links = doc.querySelectorAll("link");
    for (let i = 0; i < links.length; i += 1) {
      const link = links[i];
      const preloadLink = document.createElement("link");
      preloadLink.href = link.href;
      preloadLink.rel = "preload";
      preloadLink.as = "style";
      document.head.appendChild(preloadLink);
    }
  }

  async function precache(src: string) {
    // fetch html file
    const content = await fetch(src, { credentials: "include" }).then((data) =>
      data.text()
    );
    // parse the file from string
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    // iterate over document, precache content by tag type
    cacheImgs(doc);
    cacheLinks(doc);
    cacheScripts(doc);
  }

  interface INetworkInformation extends NetworkInformation {
    effectiveType?: string;
  }
  interface INavigator extends globalThis.Navigator {
    connection: INetworkInformation;
  }

  function hyperlinkPrecache(src: string) {
    const { connection } = navigator as INavigator;
    const { effectiveType } = connection || {};
    // only precache on fast or undefined connections
    if (
      typeof effectiveType !== "string" ||
      !/\slow-2g|2g|3g/.test(effectiveType)
    )
      precache(src);
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // get target details
          const { target } = entry;
          const src = target.getAttribute("href");
          // if src valid, trigger precache
          if (src) hyperlinkPrecache(src);
          // unobserve anchor
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    }
  );

  function initialize() {
    // iterate over each anchor; setup observers
    const anchors = document.querySelectorAll("a");
    for (let i = 0; i < anchors.length; i += 1) {
      const anchor = anchors[i];
      // if anchor contains 'precache' attribute, add to observer
      const precacheAttr = typeof anchor.getAttribute("precache") === "string";
      if (precacheAttr) observer.observe(anchor);
    }
  }

  window.addEventListener("load", initialize, false);
})();
