import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import { PurgeCSS } from 'purgecss';
import { writeFileSync } from 'fs';
import path from 'path';

async function treeShakeCSS() {
  const content = path.join(process.cwd(), './public/**/index.html');
  const css = path.join(process.cwd(), './public/assets/css/**/*.css');
  const result = await new PurgeCSS().purge({
    css: [css],
    content: [content],
  });
  result.forEach((r) => {
    writeFileSync(r.file, r.css, 'utf8');
  });
}

const treeShakeCSSOutput = {
  // using the rollup output lifecycle hook "writeBundle",
  // we can look at the outputted css in 'public/assets/css',
  // then run the PurgeCSS function to treeshake those bundles,
  // finally we save the purged output to the same bundle location
  writeBundle() {
    return treeShakeCSS();
  },
};

export default {
  output: {
    dir: 'public',
    assetFileNames: (assetInfo) => {
      let extType = assetInfo.name.split('.')[1];
      if (/css/i.test(extType)) {
        return `assets/${extType}/[name]-[hash][extname]`;
      }
      if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
        extType = 'img';
      }
      return `assets/${extType}/[name]-[hash][extname]`;
    },
    entryFileNames: 'assets/js/[name]-[hash].js',
    plugins: [treeShakeCSSOutput],
  },
  plugins: [
    html({
      input: ['**/index.html'],
      rootDir: path.join(process.cwd(), './www/html'),
      flattenOutput: false,
    }),
  ],
};
