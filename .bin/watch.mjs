/**
 * watch.mjs -- file change side-effect script
 *
 * Given a directory and a command, this script will watch the target
 * directory and run the provided command whenever any files change.
 *
 * @arg {string} cmd The command to run, e.g., `--cmd 'yarn build'`
 * @arg {string} dir The target directory, e.g., `--dir www/html/blog`
 * @arg {string | undefined} ignore File patterns to ignore, e.g., `built-file.html`
 *
 */

import chokidar from "chokidar";
import { spawn } from "child_process";
import args from "./args.mjs";

const {
  dir,
  cmd,
  ignore: ignored,
} = args(["dir", "cmd"], { optional: ["ignore"] });

console.log(
  `watch.mjs watching for changes in "${dir}" and will run "${cmd}" in response \n`
);

chokidar.watch(dir, { ignoreInitial: true }).on("all", function (_event, path) {
  if (ignored && path.match(ignored)) return; // break infinite loops
  // run the provided command with its args
  const [command, ...args] = cmd.split(" ");
  spawn(command, args, {
    stdio: "inherit",
  });
});
