/**
 * sass.ts
 * This file contains deno filesystem bindings for compiling with sass-lang,
 * as well as watching the compiled files for changes.
 * @arg path The directory with *.scss files to compile to *.css.
 * @example Run with the following command:
 * `deno run --allow-read --allow-write --allow-env='SASS_PATH' sass.ts www/css`
 * @arg watch Whether or not to watch the provided path for changes.
 * @example Run with the following command:
 * `deno run --allow-read --allow-write --allow-env='SASS_PATH' sass.ts www/css --watch`
 */

import sass from "sass";
import { join } from "path";
import yargs from "yargs";

// derive arguments
const {
  _: [__target],
  watch,
} = yargs(Deno.args).parse();

if (!__target)
  throw new Error(
    "WHOOPS! Please provide a path to compile when running this script."
  );

if (__target.includes("."))
  throw new Error(
    "WHOOPS! Please only provide a directory to target, not a file."
  );

// setup dirname from provided target argument
const __dirname = join(Deno.cwd(), __target);

// overwrite location for sass to run in an expected way
window.location = {
  href: __dirname,
} as typeof window.location;

// create array of all *.scss files in the target directory
const modules: string[] = [];
const styles: string[] = [];

function handleDirEntry(dirEntry: Deno.DirEntry, path: string) {
  if (dirEntry.isFile && dirEntry.name.includes(".scss")) {
    if (dirEntry.name[0] === "_") {
      modules.push(join(path, dirEntry.name));
    } else {
      styles.push(join(path, dirEntry.name));
    }
  }
}

async function walkRecursively(directory: string) {
  for await (const dirEntry of Deno.readDir(directory)) {
    if (dirEntry.isDirectory) {
      await walkRecursively(join(directory, dirEntry.name));
    }
    if (dirEntry.isFile) {
      handleDirEntry(dirEntry, directory);
    }
  }
}

await walkRecursively(__dirname);

// create an object of modules and their raw content
let moduleContent: { [key: string]: string } = {};

// populate the moduleContent object with file paths and their content
for (const module of modules) {
  const raw = await Deno.readTextFile(module);
  moduleContent = { ...moduleContent, [module]: raw };
}

// populate the styleContent object with file paths and their content
for (const style of styles) {
  await compileSassToCss(style);
}

// fx that takes a filename for sass and writes it to the filesystem
async function compileSassToCss(filename: string) {
  // get the raw scss
  let raw = "";
  try {
    raw = await Deno.readTextFile(filename);
  } catch {
    console.warn(`Uhoh, "${filename}" does not exist. Aborting compilation.`);
  }
  if (raw) {
    // parse and replace imported modules with their raw sass content
    const parsed = parseAndSubstituteImports(raw);
    // compile to css
    const compiled = await sass.compileStringAsync(parsed, {
      sourceMap: false,
      style: "compressed",
    });
    // write to filesystem
    filename = filename.replace(".scss", ".css");
    await Deno.writeTextFile(filename, compiled.css);
    console.log(`Compiled: ${filename}`);
  }
}

// fx that finds imports in stylesheet and replaces it with that module's content
function parseAndSubstituteImports(css: string) {
  // find all import statements in the stylesheet
  const importRegex = /(\@import)\s(?:.+);/g;
  const importz = css.match(importRegex) ?? [];
  // for each import ...
  for (const imported of importz) {
    // extract the path (e.g., "/_module.scss")
    const filenameRegex = /\/(?:.+)(\.scss)/g;
    const filenameShort = (imported.match(filenameRegex) ?? [])[0];
    // match the path to the corresponding module
    const filenameLong = modules.find((module) =>
      module.includes(filenameShort)
    );
    // replace the import statement with the corresponding module's content
    if (filenameLong) {
      css = css.replace(imported, moduleContent[filenameLong]);
    } else {
      throw new Error("WHOOPS! Undefined file referenced.");
    }
  }
  return css;
}

if (watch) {
  const watcher = Deno.watchFs(__dirname, { recursive: true });
  const notifiers = new Map<string, number>();
  for await (const event of watcher) {
    const dataString = JSON.stringify(event);
    if (notifiers.has(dataString)) {
      clearTimeout(notifiers.get(dataString));
      notifiers.delete(dataString);
    }

    notifiers.set(
      dataString,
      setTimeout(async () => {
        // Send notification here
        notifiers.delete(dataString);
        if (["create", "modify"].includes(event.kind)) {
          for (const file of event.paths) {
            if (file.includes(".scss")) await handleFileChange(file);
          }
        }
      }, 200)
    );
  }
}

async function handleFileChange(filename: string) {
  const filenameShort = filename.split(__dirname)[1];
  console.log(`... detected change in: ${filenameShort}`);
  // identify scss file type
  const type = filenameShort.includes("_") ? "module" : "style";
  // if filename is not in relevant data array, push filename to that array
  if (type === "module" && !modules.includes(filename)) modules.push(filename);
  if (type === "style" && !styles.includes(filename)) styles.push(filename);
  // figure out effected files
  const updates: string[] = [];
  switch (type) {
    case "module": {
      // update the relevant module's content
      const content = await Deno.readTextFile(filename);
      moduleContent = { ...moduleContent, [filename]: content };
      // check which styles have been updated
      for (const style of styles) {
        let raw = "";
        try {
          raw = await Deno.readTextFile(style);
        } catch {
          console.warn(
            `Uhoh, "${style}" does not exist. Aborting compilation.`
          );
        }
        if (raw) {
          // if the stylesheet imports the module, recompiled that stylesheet
          const importRegex = new RegExp(`@import ".${filenameShort}";`, "gi");
          if (raw.match(importRegex)) updates.push(style);
        }
      }
      break;
    }
    case "style":
      updates.push(filename);
      break;
    default: {
      const neverHappens: never = type;
      return neverHappens;
    }
  }
  // compile the files
  for (const update of updates) {
    await compileSassToCss(update);
  }
}