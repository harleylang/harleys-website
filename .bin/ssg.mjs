/**
 * ssg.mjs -- static site generation script
 * 
 * @arg {string | undefined} base
 * The directory to target for ssg iteration. If not defined,
 * the template's path is used for iteration.
 * @arg {string} template The path to the template.html file.
 * @example Folder structure:
    /blog                   <-- "base" - nested folders are targeted for iteration
    |- index.html           <-- this file is ignored
    |- blog-template.html   <-- "template" - this file is the template
    |- header.html          <-- this is the GLOBAL header slot default / fallback
    |- /2020                
        |- article.html
        |- header.html      <-- this is the LOCAL header slot override
 *
 */

// TODO:
// - make template arg flexible; can only be relative path from cmd location atm

import { readFileSync, writeFileSync } from "fs";
import glob from "glob";
import { dirname } from "path";
import args from "./args.mjs";

// setup helper data / fxs
const ssgSlotSyntax = /(?<=<!--ssg:).*(?=-->)/g;

function content(slots, path, content = {}) {
  slots.forEach((slot) => {
    try {
      // if there is content, use it
      const file = readFileSync(path + "/" + slot, "utf-8");
      if (file) content[slot] = file;
    } catch {
      // else if no global content, use empty string to clear html comments
      if (!content[slot]) content[slot] = "";
    }
  });
  return content;
}

// destructure script args
const {
  template = null,
  base: __base = process.cwd() + "/" + dirname(template),
  __template = process.cwd() + "/" + template,
} = args(["base", "template"], { optional: ["base"] });

// derive ssg slots
const html = readFileSync(__template, "utf-8");
const slots = html.match(ssgSlotSyntax);

// gather global slot content from base
const globalSlotContent = content(slots, __base);

// iterate over base
glob(
  `${__base}/**/*.html`,
  { ignore: `${__base}/*.html` },
  function (err, files) {
    const __directories = new Set(files.map((file) => dirname(file)));
    __directories.forEach((__dir) => {
      // update slots
      const localSlotContent = content(slots, __dir, globalSlotContent);
      const regex = new RegExp(
        Object.keys(localSlotContent)
          .map((key) => `<!--ssg:${key}-->`)
          .join("|"),
        "gi"
      );
      let sscontent = html.replace(
        regex,
        (matched) => localSlotContent[matched.match(ssgSlotSyntax)]
      );
      // update relative paths
      const relativity = (__dir.split(__base)[1].match(/\//g) || []).length + 1;
      const test = /(?<=)("\.\.\/)/g;
      sscontent = sscontent.replace(
        test,
        (matched) => `"${"../".repeat(relativity)}`
      );
      // write file
      writeFileSync(`${__dir}/index.html`, sscontent);
    });
  }
);
