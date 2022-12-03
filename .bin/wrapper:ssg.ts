import { dirname, join } from 'path';
import yargs from 'yargs';

import filewalker from './filewalker.ts';

interface ISsg {
  base?: string;
  template?: string;
  filename?: string;
}

/**
 * ssgWrapper()
 * Given a template and a target directory base, this script will
 * iterate over the nested directories from the base directory and
 * files that match the content specified in the template.
 * @arg {string | undefined} base
 * The directory to target for ssg iteration. If not defined,
 * the template's path is used for iteration.
 * @arg {string} template The path to the template.html file.
 * The template file should include one or more HTML comments with
 * slots defined using the syntax: `<!--ssg:file-name-here.html-->`.
 * For each directory in the base path that includes at least 1 slot,
 * an `index.html` is generated with
 * @arg {string | undefined} filename
 * If provided with a filename, only the directory where that file belongs
 * will be re-generated.
 * @example Folder structure:
    blog                     <-- "base" - nested folders are targeted for iteration
    └── index.html           <-- this file is ignored
    └── blog-template.html   <-- "template" - this file is the template
    |                             - within this file are two slots:
    |                             <!--ssg:article.html--> and <!--ssg:header.html-->
    └── article.html         <-- this is the GLOBAL article slot default / fallback
    |                           (global slots are not required; script will fail graciously)
    └── header.html          <-- this is the GLOBAL header slot default / fallback
    └── 2020/10
        └── article.html     <-- this is the LOCAL article slot override
        └── index.html       <-- SSG'd file w/ LOCAL article and GLOBAL header
    └── 2020/11
        └── article.html     <-- this is the LOCAL article slot override
        └── header.html      <-- this is the LOCAL header slot override
        └── index.html       <-- SSG'd file w/ both LOCAL article AND header
 */
export default async function ssgWrapper({ base = '', template = '', filename = '' }: ISsg = {}) {
  const {
    base: __base,
    template: __template,
  } = yargs(Deno.args).parse();

  if (!template && !__template) {
    throw new Error(
      'WHOOPS! Please provide a template to compile when running this script.',
    );
  }

  if (!template) template = join(Deno.cwd(), __template);
  if (!base) base = __base ?? dirname(template);

  // setup helper data / fxs
  const ssgSlotSyntax = /(?<=<!--ssg:).*(?=-->)/g;

  // derive ssg slots
  const html = await Deno.readTextFile(template);
  const slots = html.match(ssgSlotSyntax) ?? [];

  // gather global slot content from base into obj
  // keys are file names for the content, values are the content within that file
  const globalSlotContent = await content(slots, base);

  // iterate over relevant nested files from the base directory
  const files = await filewalker({ rootDir: base, pattern: /(.*)(.html)/g });
  const allDirectories = [...new Set(files.map((file) => dirname(file)))].filter((dir) =>
    dir !== base
  );

  // determine relevant directories to generate
  let directories: string[] = [];
  switch (true) {
    case (filename && allDirectories.some((directory) => dirname(filename).includes(directory))):
      directories = [dirname(filename)];
      break;
    case (filename && dirname(filename) === base):
    default:
      directories = allDirectories;
      break;
  }

  // re-generate the target directories
  for (const directory of directories) {
    // update slots
    const localSlotContent = await content(slots, directory, globalSlotContent);
    const regex = new RegExp(
      Object.keys(localSlotContent)
        .map((key) => `<!--ssg:${key}-->`)
        .join('|'),
      'gi',
    );
    let sscontent = html.replace(
      regex,
      (matched) => localSlotContent[matched.match(ssgSlotSyntax) as unknown as string],
    );
    // update relative paths
    const relativity = (directory.split(base)[1].match(/\//g) || []).length + 1;
    const relativePathStr = /(?<=)("\.\.\/)/g;
    sscontent = sscontent.replace(relativePathStr, () => `"${'../'.repeat(relativity)}`);
    // write file
    await Deno.writeTextFile(`${directory}/index.html`, sscontent);
    console.log(`📃 Statically generated: ${directory}`);
  }
}

async function content(
  slots: RegExpMatchArray,
  __path: string,
  content: { [key: string]: string } = {},
) {
  for (const slot of slots) {
    try {
      // if there is content in the taraget directory, use it
      const __file = await Deno.readTextFile(join(__path, slot));
      if (__file) content[slot] = __file;
    } catch {
      // else if no global content, use empty string to clear html comments
      if (!content[slot]) content[slot] = '';
    }
  }
  return content;
}
