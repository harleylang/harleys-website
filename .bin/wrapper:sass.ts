import sass from 'sass';
import { basename, dirname, join } from 'path';
import yargs from 'yargs';

import filewalker from './filewalker.ts';

interface ISass {
  target?: string;
  outdir?: string;
}

/**
 * @param {string} target
 * If a directory, all styles are built.
 * If a module, all dependent stylesheets.
 * If a stylesheet, only that file.
 */
export default async function sassWrapper({
  target = '',
  outdir = '',
}: ISass = {}) {
  // derive arguments
  const {
    target: __target,
    outdir: __outdir,
  } = yargs(Deno.args).parse();

  if (!target && !__target) {
    throw new Error(
      'WHOOPS! Please provide a path to compile when running this script.',
    );
  }

  if (!target) target = __target ?? '.';
  if (!outdir) outdir = __outdir ?? join(target.includes('.') ? dirname(target) : target, '/dist');

  target = join(target[0] !== '/' ? Deno.cwd() : '', target);
  outdir = join(outdir[0] !== '/' ? Deno.cwd() : '', outdir);

  const patternSCSS = new RegExp(/\.scss/);

  // overwrite location for sass to run in an expected way
  window.location = {
    href: target,
  } as typeof window.location;

  console.log(target);

  // create array of all *.scss files in the target directory
  const files = await filewalker({
    rootDir: target.includes('.') ? dirname(target) : target,
    pattern: patternSCSS,
  });
  const modules = files.filter((file) => file.match(/\_(.*)(.scss)/g));
  const styles = files.filter((file) => !file.match(/\_(.*)(.scss)/g));

  // create an object of modules and their raw content
  let moduleContent: { [key: string]: string } = {};

  // populate the moduleContent object with file paths and their content
  for (const module of modules) {
    const raw = await Deno.readTextFile(module);
    moduleContent = { ...moduleContent, [module]: raw };
  }

  let updates: string[] = [];

  // figure out which files need updating
  if (target.includes('.')) {
    // identify scss file type
    const type = basename(target).includes('_') ? 'module' : 'style';
    switch (type) {
      case 'module': {
        // check which styles have been updated
        for (const style of styles) {
          let raw = '';
          try {
            raw = await Deno.readTextFile(style);
          } catch {
            console.warn(
              `Uhoh, "${style}" does not exist. Abandoning compilation.`,
            );
          }
          if (raw) {
            // if the stylesheet imports the module, recompiled that stylesheet
            const importRegex = new RegExp(`@import "./${basename(target)}";`, 'gi');
            if (raw.match(importRegex)) updates.push(style);
          }
        }
        break;
      }
      case 'style':
        updates.push(target);
        break;
      default: {
        const neverHappens: never = type;
        return neverHappens;
      }
    }
  } else {
    updates = styles;
  }

  for (const update of updates) {
    await compileSassToCss({ filename: update, outdir, modules, moduleContent });
  }
}

interface ICompileSass {
  filename: string;
  outdir: string;
  modules: string[];
  moduleContent: { [key: string]: string };
}
// fx that takes a filename for sass and writes it to the filesystem
async function compileSassToCss({ filename, outdir, modules, moduleContent }: ICompileSass) {
  // get the raw scss
  let raw = '';
  try {
    raw = await Deno.readTextFile(filename);
  } catch {
    console.warn(`Uhoh, "${filename}" does not exist. Abandoning compilation.`);
  }
  if (raw) {
    // parse and replace imported modules with their raw sass content
    const parsed = parseAndSubstituteImports(raw, modules, moduleContent);
    // compile to css
    const compiled = await sass.compileStringAsync(parsed, {
      sourceMap: false,
      style: 'compressed',
    });
    // prepare out dir
    try {
      await Deno.stat(outdir);
    } catch {
      await Deno.mkdir(outdir);
    }
    // write to filesystem
    filename = filename.replace('.scss', '.css');
    filename = filename.replace(dirname(filename), outdir);
    await Deno.writeTextFile(filename, compiled.css);
    console.log(`Compiled: ${filename}`);
  }
}

// fx that finds imports in stylesheet and replaces it with that module's content
function parseAndSubstituteImports(
  css: string,
  modules: ICompileSass['modules'],
  moduleContent: ICompileSass['moduleContent'],
) {
  // find all import statements in the stylesheet
  const importRegex = /(\@import)\s(?:.+);/g;
  const importz = css.match(importRegex) ?? [];
  // for each import ...
  for (const imported of importz) {
    // extract the path (e.g., "/_module.scss")
    const filenameRegex = /\/(?:.+)(\.scss)/g;
    const filenameShort = (imported.match(filenameRegex) ?? [])[0];
    // match the path to the corresponding module
    const filenameLong = modules.find((module) => module.includes(filenameShort));
    // replace the import statement with the corresponding module's content
    if (filenameLong) {
      css = css.replace(imported, moduleContent[filenameLong]);
    } else {
      throw new Error('WHOOPS! Undefined file referenced.');
    }
  }
  return css;
}
