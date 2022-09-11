import esbuild from "esbuild";
import htmlPlugin from "@chialab/esbuild-plugin-html";

await esbuild.build({
  entryPoints: ["www/html/index.html"],
  entryNames: "[dir]/[name]",
  outdir: "public",
  outbase: "www/html",
  plugins: [htmlPlugin()],
  assetNames: "[dir]/[name]",
  chunkNames: "[dir]/[name]-[hash]",
  bundle: true,
  minify: true,
  write: true,
});

await esbuild.build({
  entryPoints: ["www/html/blog/index.html"],
  entryNames: "[dir]/[name]",
  outdir: "public/blog",
  outbase: "www/html/blog",
  plugins: [htmlPlugin()],
  assetNames: "[dir]/[name]",
  chunkNames: "[dir]/[name]-[hash]",
  bundle: true,
  minify: true,
  write: true,
});
