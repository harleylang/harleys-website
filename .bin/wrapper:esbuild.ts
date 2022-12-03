import * as esbuild from 'esbuild';
import { dirname, join } from 'path';
import yargs from 'yargs';

import filewalker from './filewalker.ts';

interface IEsbuild {
  target?: string;
  outdir?: string;
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
          let css;
          try {
            css = await Deno.readTextFile(
              join(Deno.cwd(), 'www/css/dist', filename),
            );
          } catch {
            throw new Error('WHOOPS! Do not forget to run `deno task bin:sass` beforehand ;)');
          }
          const slotRegex = new RegExp(
            `<!--esbuild-inject-css:${filename}-->`,
            'gi',
          );
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

/**
 * esbuildWrapper()
 * This script provides deno filesystem bindings for building typescript files
 * with esbuild, as well as watching the files for changes.
 * @arg path The directory with *.ts files to compile to *.js.
 * @example Run with the following command:
 * `deno run --allow-all esbuild.ts www/js`
 * @arg watch Whether or not to watch the provided path for changes.
 * @example Run with the following command:
 * `deno run --allow-all esbuild.ts www/js --watch`
 */
export default async function esbuildWrapper({
  target = '',
  outdir = '',
}: IEsbuild = {}) {
  // derive arguments if called by command line
  // note how if esbuildWrapper is called as a function, those args take precidence
  const {
    target: __target,
    outdir: __outdir,
  } = yargs(Deno.args).parse();

  if (!__target) {
    throw new Error(
      'WHOOPS! Please provide a path or file to compile when running this script.',
    );
  }

  if (!target) target = __target ?? '.';
  if (!outdir) outdir = __outdir ?? join(target.includes('.') ? dirname(target) : target, '/dist');

  target = join(target[0] !== '/' ? Deno.cwd() : '', target);
  outdir = join(outdir[0] !== '/' ? Deno.cwd() : '', outdir);

  // get all files in the directory
  let files: string[];
  if (target.includes('.')) {
    // if target is a file, just use that
    files = [target];
  } else {
    // if __dirname is a directory, get all nested files
    files = await filewalker({ rootDir: dirname(target), pattern: new RegExp(/\.ts/) });
  }

  // build the files
  files.forEach(async (file) => {
    // if file, get it's dir name; else use the path (it is the current directory)
    const currentDirectory = target.includes('.') ? dirname(target) : target;
    const outfile = `${
      file
        .replace(currentDirectory, outdir as string)
        .replace('.ts', '')
    }.mjs`;
    await esbuild.build({
      entryPoints: [file],
      outfile,
      outExtension: {
        '.js': '.mjs',
      },
      format: 'esm',
      bundle: true,
      minify: true,
      plugins: [
        esbuildInjectCss(),
      ],
    }).then(() => {
      console.log(`🔨 Built: ${outfile}`);
      // if not watching for changes, then clean-up the build processes
      if (files.includes(file)) {
        files = files.filter((f) => f !== file);
      }
      if (files.length === 0) {
        esbuild.stop();
      }
    });
  });
}
