import { join } from 'https://deno.land/std@0.119.0/path/win32.ts';
import esbuildWrapper from './esbuildWrapper.ts';

/**
 * hmrComponents()
 * Some components require css styles loaded directly into them.
 * This is managed by the sass/css style set up in this repo.
 * In order to trigger a rebuild, this function is attached to the
 * filewhistle and receives each file change. If the style for
 * a component is observed, then this function will trigger a
 * rebuild of the corresponding component automatically.
 * @param filename
 */
export default async function hmrComponents(filename: string) {
  if (filename.match(/me-(.*)(\.css)/g)) {
    const target = filename
      .replace('/css', '/js')
      .replace('/dist', '')
      .replace('.css', '.ts');
    await esbuildWrapper({ target, outdir: 'www/js/dist' });
    console.log(`🔔 Whislter rebuild: ${target}`);
  }
}
