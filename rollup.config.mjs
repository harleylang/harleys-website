import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import path from "path";

export default {
  output: {
    dir: "public",
    assetFileNames: (assetInfo) => {
      let extType = assetInfo.name.split(".").at(1);
      if (/css/i.test(extType)) {
        return `${extType}/[name]-[hash][extname]`;
      }
      if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
        extType = "img";
      }
      return `assets/${extType}/[name]-[hash][extname]`;
    },
    entryFileNames: "js/[name]-[hash].js",
  },
  plugins: [
    html({
      input: ["./index.html", "./blog/index.html"],
      rootDir: path.join(process.cwd(), "./www/html"),
      flattenOutput: false,
    }),
  ],
};
