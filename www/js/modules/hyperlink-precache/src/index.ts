/**
 * hyperlink-precache.mjs
 * @description
 * Looks for anchor tags with the attribute `precache`.
 * Each matching anchor tag's href is fetched. Then, the received
 * HTML is traversed for images, scripts, and styles to precache.
 * @see
 * Influenced by:
 * - https://github.com/dieulot/instantclick
 * - https://github.com/GoogleChromeLabs/quicklink/
 */

// TODO: only run on 3g or better connections
// TODO: load only those found in the intersection observer

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

  function hyperlinkPrecache() {
    // get all anchors, iterate over each anchor
    const anchors = document.querySelectorAll("a");
    for (let i = 0; i < anchors.length; i += 1) {
      const anchor = anchors[i];
      const src = anchor.getAttribute("href");
      const precacheAttr = typeof anchor.getAttribute("precache") === "string";
      // if src valid and anchor contains 'precache' attribute, trigger precache
      if (src && precacheAttr) precache(src);
    }
  }

  window.addEventListener("load", hyperlinkPrecache, false);
})();
