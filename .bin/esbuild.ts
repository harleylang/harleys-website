/**
 * esbuild.ts
 * This script provides deno filesystem bindings for building typescript files
 * with esbuild, as well as watching the files for changes.
 * @arg path The directory with *.ts files to compile to *.js.
 * @example Run with the following command:
 * `deno run --allow-all esbuild.ts www/js`
 * @arg watch Whether or not to watch the provided path for changes.
 * @example Run with the following command:
 * `deno run --allow-all esbuild.ts www/js --watch`
 */

import * as esbuild from 'esbuild';
import { dirname, join } from 'path';
import yargs from 'yargs';

import filewalker from './filewalker.ts';

// derive arguments
const {
  _: [__target, __outdir],
  watch,
} = yargs(Deno.args).parse();

if (!__target) {
  throw new Error(
    'WHOOPS! Please provide a path or file to compile when running this script.',
  );
}

// setup dirname from provided target argument
const __dirname = join(Deno.cwd(), __target.includes('.') ? dirname(__target) : __target);

// setup dist out
const __dirout = __outdir ? __outdir : join(__dirname, 'dist');

// get all files in the directory
let files: string[];
if (__target.includes('.')) {
  // if target is a file, just use that
  files = [__target.replace(dirname(__target), __dirname)];
} else {
  // if __dirname is a directory, get all nested files
  files = await filewalker({ rootDir: __dirname, pattern: new RegExp(/\.ts/) });
}

// this plugin will inject css into web-component templates that use
// the slot syntax `<!--esbuild-inject-css:file.css-->`
// this helps improve page performance
const esbuildInjectCss = (): esbuild.Plugin => {
  return {
    name: 'esbuildInjectCss',
    setup(build) {
      build.onLoad({ filter: /\.ts$/ }, async (args) => {
        let contents = await Deno.readTextFile(args.path);
        const cssSlotSyntax = /(?<=<!--esbuild-inject-css:).*(?=-->)/g;
        const slots = contents.match(cssSlotSyntax) ?? [];
        for (const filename of slots) {
          const css = await Deno.readTextFile(join(Deno.cwd(), 'www/css/dist', filename));
          const slotRegex = new RegExp(`<!--esbuild-inject-css:${filename}-->`, 'gi');
          contents = contents.replace(slotRegex, `<style>${css}</style>`);
        }
        return {
          contents,
          loader: 'ts',
        };
      });
    },
  };
};

// build the files
files.forEach(async (file) => {
  const outfile = `${file.replace(__dirname, __dirout).replace('.ts', '')}.mjs`;
  await esbuild.build({
    entryPoints: [file],
    outfile,
    outExtension: {
      '.js': '.mjs',
    },
    format: 'esm',
    bundle: true,
    minify: true,
    watch: watch
      ? {
        onRebuild(error, _result) {
          if (error) console.error('... build failed:', error);
          else console.log('... rebuilding:', outfile);
        },
      }
      : undefined,
    plugins: [
      esbuildInjectCss(),
    ],
  }).then(() => {
    // if not watching for changes, then clean-up the build processes
    if (!watch) {
      console.log(`Built: ${outfile}`);
      if (files.includes(file)) {
        files = files.filter((f) => f !== file);
      }
      if (files.length === 0) {
        esbuild.stop();
      }
    }
  });
});
