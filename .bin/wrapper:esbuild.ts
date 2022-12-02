import * as esbuild from 'esbuild';
import { dirname, join } from 'path';
import yargs from 'yargs';

import filewalker from './filewalker.ts';

interface IEsbuild {
  target?: string;
  outdir?: string;
  watch?: boolean;
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
  target,
  outdir,
  watch,
}: IEsbuild = {}) {
  // derive arguments if called by command line
  // note how if esbuildWrapper is called as a function, those args take precidence
  const {
    _: [__target, __outdir],
    watch: __watch,
  } = yargs(Deno.args).parse();

  if (!__target) {
    throw new Error(
      'WHOOPS! Please provide a path or file to compile when running this script.',
    );
  }

  if (!target) {
    target = __target as string;
  }

  const __dirname = join(
    target[0] === '/' ? '' : Deno.cwd(),
    target.includes('.') ? dirname(target) : target,
  );

  if (!outdir) {
    outdir = __outdir ? __outdir as string : join(__dirname, 'dist');
  }

  if (!watch) {
    watch = __watch;
  }

  // get all files in the directory
  let files: string[];
  if (target.includes('.')) {
    // if target is a file, just use that
    files = [target.replace(dirname(target), __dirname)];
  } else {
    // if __dirname is a directory, get all nested files
    files = await filewalker({ rootDir: __dirname, pattern: new RegExp(/\.ts/) });
  }

  // build the files
  files.forEach(async (file) => {
    const outfile = `${file.replace(__dirname, outdir as string).replace('.ts', '')}.mjs`;
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
      console.log(`Built: ${outfile}`);
      // if not watching for changes, then clean-up the build processes
      if (!watch) {
        if (files.includes(file)) {
          files = files.filter((f) => f !== file);
        }
        if (files.length === 0) {
          esbuild.stop();
        }
      }
    });
  });
}
