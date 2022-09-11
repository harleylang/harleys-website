/**
 * hyperlink-precache.mjs
 * @description
 * Looks for anchor tags with the attribute `precache`.
 * Each matching anchor tag's href is fetched. Then, the received
 * HTML is traversed for images, scripts, and styles to precache.
 * @example
 * In your *.html file:
  <head>
    <!-- ... add the following script ... -->
    <script type="module" src="hyperlink-precache.mjs"></script>
    <!-- ... -->
  </head>
  <body>
    <!-- ... add the `precache` attribute to any anchor ... -->
    <a href="./test.html" precache>testing</a>
    <!-- ... -->
  </body>
 * @see
 * Influenced by:
 * - https://addyosmani.com/blog/prefetching/
 * - https://github.com/dieulot/instantclick
 * - https://github.com/GoogleChromeLabs/quicklink/
 */

(() => {
  function parseRelativePath({ src, target }: { src: string; target: string }) {
    const pathLevelsSrc = src.split("./")[1].split("/").length - 1;
    const relativeLevelsSrc = src.split("../").length - 1;
    const relativeLevelsTarget = target.split("../").length - 1;
    // if relative paths are used in the src and/or target
    // append / snip "../" to correctly load scripts and modules
    switch (true) {
      case src.includes("../"):
        return `${"../".repeat(relativeLevelsSrc)}${target}`;
      case src.includes("./"):
        // target requires relativity
        if (relativeLevelsTarget === 0 && pathLevelsSrc > 0) {
          return `${src
            .split("/")
            .slice(0, pathLevelsSrc + 1)
            .join("/")}/${target}`;
        }
        // target does not have enough relativity
        if (pathLevelsSrc < relativeLevelsTarget) {
          return `${target
            .split("../")
            .slice(-(relativeLevelsTarget - pathLevelsSrc + 1))
            .join("../")}`;
        }
        break;
      default:
        return target;
    }
    return target;
  }

  interface ICacheFx {
    doc: Document;
    src: string;
  }

  function cacheImgs({ doc }: Pick<ICacheFx, "doc">) {
    const imgs = doc.querySelectorAll("img");
    for (let i = 0; i < imgs.length; i += 1) {
      const img = imgs[i];
      new Image().src = img.getAttribute("src") ?? "";
    }
  }

  function cacheScripts({ doc, src }: ICacheFx) {
    const scripts = doc.querySelectorAll("script");
    for (let i = 0; i < scripts.length; i += 1) {
      const script = scripts[i];
      const preloadLink = document.createElement("link");
      const target = parseRelativePath({
        src,
        target: script.getAttribute("src") ?? "",
      });
      preloadLink.href = target;
      preloadLink.rel = "preload";
      preloadLink.as = "script";
      document.head.appendChild(preloadLink);
    }
  }

  function cacheLinks({ doc, src }: ICacheFx) {
    const links = doc.querySelectorAll("link");
    for (let i = 0; i < links.length; i += 1) {
      const link = links[i];
      const preloadLink = document.createElement("link");
      const target = parseRelativePath({
        src,
        target: link.getAttribute("href") ?? "",
      });
      preloadLink.href = target ?? "";
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
    cacheImgs({ doc });
    cacheLinks({ doc, src });
    cacheScripts({ doc, src });
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
