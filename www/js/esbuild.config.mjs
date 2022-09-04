import esbuild from "esbuild";
// eslint-disable-next-line import/no-extraneous-dependencies
import { minifyTemplates, writeFiles } from "esbuild-minify-templates";
// eslint-disable-next-line import/no-extraneous-dependencies
import svg from "esbuild-plugin-svg";

async function config() {
  const filename = process.cwd().split("/").at(-1);
  await esbuild.build({
    entryPoints: [`./src/index.ts`],
    format: "esm",
    outfile: `./dist/${filename}.mjs`,
    outExtension: {
      ".js": ".mjs",
    },
    plugins: [minifyTemplates(), svg(), writeFiles()],
    loader: { ".html": "text", ".css": "text" },
    bundle: true,
    minify: true,
    write: false,
  });
}

export default config();
