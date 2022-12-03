/**
 * filewhistler.ts
 * This script watches files for changes and in response,
 * passes those files onto scripts that respond to changes.
 * Helpful for piping those files to other scripts in response.
 * @arg {string} path The directory with files to watch.
 * @example Run with the following command:
 * `deno run filewhistle.ts www/css`
 */

import yargs from 'yargs';

import filewatcher from './filewatcher.ts';

import plugins from './filewhistler.plugins.ts';

// derive arguments
const {
  target,
} = yargs(Deno.args).parse();

if (!target) {
  throw new Error(
    'WHOOPS! Please provide a target to compile when running this script.',
  );
}

if (target.includes('.')) {
  throw new Error(
    'WHOOPS! Please only provide a directory to target, not a file.',
  );
}

console.log('🔔 Whistler activated\n');

await filewatcher({
  directory: target,
  callback: handleWhistle,
});

async function handleWhistle(filename: string) {
  for (const plugin of plugins) {
    const result = await plugin(filename);
    if (result) {
      console.log(`🔔 Whistler event: ${filename}`);
    }
  }
}

/**
 * IWhistlePlugin
 * A function that takes a filename and runs a side-effect script.
 * @param {string} filename
 * @returns {string | null}
 * Filename as string if the whistle triggered; null if not.
 */
interface IWhistlePlugin {
  (filename: string): Promise<string | null>;
}
export type { IWhistlePlugin };
