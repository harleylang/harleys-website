import esbuild from "esbuild";
// eslint-disable-next-line import/no-extraneous-dependencies
import { minifyTemplates, writeFiles } from "esbuild-minify-templates";
// eslint-disable-next-line import/no-extraneous-dependencies
import svg from "esbuild-plugin-svg";

async function config() {
  await esbuild.build({
    entryPoints: [`./src/index.ts`],
    outfile: `./dist/index.js`,
    plugins: [minifyTemplates(), svg(), writeFiles()],
    loader: { ".html": "text", ".css": "text" },
    bundle: true,
    minify: true,
    write: false,
  });
}

export default config();
