// eslint-disable-next-line import/no-extraneous-dependencies
import { esbuildPlugin } from "@web/dev-server-esbuild";
import args from "../../../.bin/args.mjs";

function config({ element }) {
  return {
    open: true,
    watch: true,
    nodeResolve: true,
    rootDir: "../../../",
    appIndex: "../../../js/components/sandbox.html",
    plugins: [
      esbuildPlugin({
        ts: true,
        js: true,
        loaders: { ".css": "text" },
      }),
      {
        name: "inject-module-in-development",
        transform(context) {
          if (context.response.is("html")) {
            let updated = context.body.replace(
              /<div id="js-script"><\/div>/,
              `<script type="module" src="${element}/src/index.ts"></script>`
            );
            updated = updated.replace(
              /<div id="sandbox"><\/div>/,
              `<script type="module" src="${element}/sandbox.mjs"></script>`
            );
            updated = updated.replace(
              /<div id="root"><\/div>/,
              `<div id="root"><${element}></${element}></div>`
            );
            return updated;
          }
          return undefined;
        },
      },
    ],
  };
}

const { element } = args(["element"]);

export default config({ element });
