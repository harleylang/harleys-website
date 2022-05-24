import esbuild from "esbuild";
import htmlPlugin from "@chialab/esbuild-plugin-html";

await esbuild.build({
  entryPoints: ["src/index.html"],
  entryNames: "[dir]/[name]",
  outdir: "public",
  outbase: "src",
  plugins: [htmlPlugin()],
  assetNames: "[dir]/[name]",
  bundle: true,
  minify: true,
  write: true,
});
