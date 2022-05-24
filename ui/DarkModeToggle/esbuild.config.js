import esbuild from "esbuild";
import { minifyTemplates, writeFiles } from "esbuild-minify-templates";
import svg from "esbuild-plugin-svg";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  plugins: [minifyTemplates(), svg(), writeFiles()],
  loader: { ".html": "text", ".css": "text" },
  bundle: true,
  minify: true,
  write: false,
});
