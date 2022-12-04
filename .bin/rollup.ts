import { OutputOptions, rollup, RollupOptions } from 'rollup';
import { rollupPluginHTML as html } from 'rollup-plugin-html';
import { join } from 'path';
import { PurgeCSS } from 'purgecss';

import filewalker from './filewalker.ts';
import raw from './raw.ts';

const __dirname = join(Deno.cwd(), './www/html');

async function treeShakeCSS() {
  // get raw html
  const filesHTML = await filewalker({
    rootDir: join(Deno.cwd(), 'public'),
    pattern: new RegExp(/index\.html/),
  });
  const rawHTML = await raw(filesHTML);
  // get raw js
  const filesJS = await filewalker({
    rootDir: join(Deno.cwd(), 'public/assets/js'),
    pattern: new RegExp(/\.js/),
  });
  const rawJS = await raw(filesJS);
  // array of content that could have classes defined within it
  const content = [
    ...Object.values(rawHTML).map((raw) => {
      return {
        extension: 'html',
        raw: raw,
      };
    }),
    ...Object.values(rawJS).map((raw) => {
      return {
        extension: 'js',
        raw: raw,
      };
    }),
  ];
  // get raw css
  const filesCSS = await filewalker({
    rootDir: join(Deno.cwd(), 'public/assets/css'),
    pattern: new RegExp(/\.css/),
  });
  const rawCSS = await raw(filesCSS);
  const css = Object.keys(rawCSS).map((name) => {
    return {
      name,
      raw: rawCSS[name],
    };
  });
  // purge
  const result = await new PurgeCSS().purge({
    css,
    content,
  });
  // write
  await result.forEach(async (r) => {
    if (r.file) {
      await Deno.writeTextFile(r.file, r.css);
    }
  });
}

const treeShakeCSSOutput = {
  // using the rollup output lifecycle hook "writeBundle",
  // we can look at the outputted css in 'public/assets/css',
  // then run the PurgeCSS function to treeshake those bundles,
  // finally we save the purged output to the same bundle location
  name: 'treeShakeCSSOutpue',
  writeBundle() {
    return treeShakeCSS();
  },
};

// rollup configuration
const config: RollupOptions & { output: OutputOptions } = {
  output: {
    dir: join(Deno.cwd(), 'public/'),
    assetFileNames: (assetInfo) => {
      let extType = assetInfo?.name?.split('.')[1] ?? '';
      if (/css/i.test(extType)) {
        return `assets/${extType}/[name]-[hash][extname]`;
      }
      if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
        extType = 'img';
      }
      return `assets/${extType}/[name]-[hash][extname]`;
    },
    entryFileNames: 'assets/js/[name]-[hash].js',
    // plugins: [treeShakeCSSOutput],
  },
  plugins: [
    html({
      input: [
        ...await filewalker({
          rootDir: join(Deno.cwd(), 'www/html'),
          pattern: new RegExp(/index.html/),
        }),
      ],
      rootDir: __dirname,
      flattenOutput: false,
    }),
  ],
};

// initiate build
const build = await rollup(config);
await build.write(config.output);

// write robots.txt
Deno.writeTextFile('public/robots.txt', 'User-agent: *\nAllow: /\n');

// success message
console.log('🎁 Production build complete.');
