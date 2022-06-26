import { esbuildPlugin } from "@web/dev-server-esbuild";

function config({ element }) {
  return {
    open: true,
    watch: true,
    nodeResolve: true,
    rootDir: "../../",
    appIndex: "../../js/sandbox.html",
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
              /<div id="root"><\/div>/,
              `<div id="root"><${element}></${element}></div>`
            );
            return updated;
          }
        },
      },
    ],
  };
}

function argLoader() {
  let rawargs = process.argv.filter((v) => v.includes("="));
  let argObj = {};
  for (let a = 0; a < rawargs.length; a++) {
    let [key, val] = rawargs[a].split("=");
    argObj[key] = val;
  }
  return argObj;
}

const args = argLoader();

if (typeof args.element === "undefined")
  throw new Error('ERROR: missing arg "element"');

const { folder, element } = args;

export default config({ folder, element });
