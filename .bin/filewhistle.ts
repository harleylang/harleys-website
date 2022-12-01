/**
 * filewhistle.ts
 * This script watches files for changes and in response,
 * console.logs() their filename. Helpful for piping those files
 * to other scripts in response.
 * @arg {string} path The directory with files to watch.
 * @example Run with the following command:
 * `deno run fileEffect.ts www/css`
 * @arg {RegExp} pattern Filter file changes with this regex.
 */

import yargs from 'yargs';

import filewatcher from './filewatcher.ts';

import hmrComponents from './hmr:components.ts';

// derive arguments
const {
  _: [__path],
} = yargs(Deno.args).parse();

if (!__path) {
  throw new Error(
    'WHOOPS! Please provide a path to compile when running this script.',
  );
}

if (__path.includes('.')) {
  throw new Error(
    'WHOOPS! Please only provide a directory to target, not a file.',
  );
}

function delay(time: number) {
  return;
}

await new Promise(function (resolve) {
  setTimeout(resolve, 3000);
});
console.log('🔔 Whistler activated');

await filewatcher({
  directory: __path,
  callback: handleWhistle,
});

async function handleWhistle(filename: string) {
  await hmrComponents(filename);
}
