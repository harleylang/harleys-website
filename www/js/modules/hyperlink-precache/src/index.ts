async function precache(src: string) {
  const content = await fetch(src, { credentials: "include" }).then((d) =>
    d.text()
  );
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const imgs = doc.querySelectorAll("img");
  const scripts = doc.querySelectorAll("script");
  const links = doc.querySelectorAll("link");
  for (let i = 0; i < imgs.length; i += 1) {
    const img = imgs[i];
    new Image().src = img.getAttribute("src") ?? "";
  }
  for (let i = 0; i < scripts.length; i += 1) {
    const script = scripts[i];
    const preloadLink = document.createElement("link");
    preloadLink.href = script.src;
    preloadLink.rel = "preload";
    preloadLink.as = "script";
    document.head.appendChild(preloadLink);
  }
  for (let i = 0; i < links.length; i += 1) {
    const link = links[i];
    const preloadLink = document.createElement("link");
    preloadLink.href = link.href;
    preloadLink.rel = "preload";
    preloadLink.as = "style";
    document.head.appendChild(preloadLink);
  }
}

/**
 * hyperlink-precache.mjs
 * @description
 * Looks for anchor tags with the attribute `data-precache`.
 * Each matching anchor tag's href is fetched. Then, the received
 * HTML is traversed for images, scripts, and styles to precache.
 * @see
 * Influenced by:
 * - https://github.com/dieulot/instantclick
 * - https://github.com/GoogleChromeLabs/quicklink/
 */
function hyperlinkPrecache() {
  const anchors = document.querySelectorAll("a");
  for (let i = 0; i < anchors.length; i += 1) {
    const anchor = anchors[i];
    const src = anchor.getAttribute("href");
    if (src) {
      precache(src);
      // TODO: optimize preloadContent
      // TODO: querySelect those with data attributes
      // TODO: only run on 4g or better connections
      // TODO: load only those found in the intersection observer
    }
  }
}

window.addEventListener("load", hyperlinkPrecache, false);
