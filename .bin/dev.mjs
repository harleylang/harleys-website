/**
 * dev.js -- development environment boot script
 *
 * This script finds js modules with a development environment at `www/js`.
 * Each directory that is a yarn workspace is listed in the console via inquirer.
 * Next, the user selects which workspace they want to run.
 * Finally, the chosen module is plugged into this command:
 * `yarn workspace @harleys-website/X dev`
 */

import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dir = join(__dirname, '..', 'www', 'js', 'components');

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(join(path, file)).isDirectory();
  });
}

const files = getDirectories(dir);

console.log(
  chalk.white(`
SANDBOX DEVELOPMENT ENVIRONMENT for js modules in "www/js/*"\n
Follow the prompts to proceed or type ctrl+c to escape. \n
`),
);

inquirer
  .prompt({
    type: 'list',
    name: 'module',
    message: 'Which module would you like to run in development mode?',
    choices: files,
  })
  .then((answers) => {
    console.log(
      chalk.green(
        `\n Starting ${answers.module} development environment ... \n`,
      ),
    );
    spawn('yarn', ['workspace', `@harleys-website/${answers.module}`, 'dev'], {
      stdio: 'inherit',
    });
  });
