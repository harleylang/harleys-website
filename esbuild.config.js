import esbuild from "esbuild";
import htmlPlugin from "@chialab/esbuild-plugin-html";

await esbuild.build({
  entryPoints: ["www/html/index.html"],
  entryNames: "[dir]/[name]",
  outdir: "public",
  outbase: "www/html",
  plugins: [htmlPlugin()],
  assetNames: "[dir]/[name]",
  bundle: true,
  minify: true,
  write: true,
});
