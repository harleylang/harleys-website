/**
 * dev.js -- script
 *
 * finds directories in www/js
 * - each directory is a yarn workspace
 * lists each workspace using inquirer.js
 * plugs the chosen module into this command:
 * `yarn workspace @harleys-website/X dev`
 *
 */

import fs from "fs";
import inquirer from "inquirer";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dir = join(__dirname, "..", "www", "js");

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory();
  });
}

var files = getDirectories(dir);

inquirer
  .prompt({
    type: "list",
    name: "module",
    message: "Which module would you like to run in development mode?",
    choices: files,
  })
  .then((answers) => {
    spawn("yarn", ["workspace", `@harleys-website/${answers.module}`, "dev"], {
      stdio: "inherit",
    });
  });
