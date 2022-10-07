import { fileURLToPath } from "url";
import args from "./args.mjs";

const { target } = args(["target"]);

console.log(target);

// TODO:
// get template
// extract ssg comments from template
// iterate recursively over dirs alongside template
// for each folder with  *.html files:
//// match the filename to the template
//// if the filename exists in the template, replace portion of template w/ content
//// output index.html
// update relative paths with additional ../ for each level of recursion
//// find `"../` and replace with `"${'../'.repeat(levelsOfRecursion + 1)}`
// add build:ssg:blog to build command flow
