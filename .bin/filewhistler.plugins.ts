import { IWhistlePlugin } from './filewhistler.ts';

import esbuildWrapper from './esbuild.wrapper.ts';
import sassWrapper from './sass.wrapper.ts';
import ssgWrapper from './ssg.wrapper.ts';

/**
 * whistleComponents()
 * Some components require css styles loaded directly into them.
 * This is managed by the sass/css style set up in this repo.
 * In order to trigger a rebuild, this function is attached to the
 * filewhistle and receives each file change. If the style for
 * a component is observed, then this function will trigger a
 * rebuild of the corresponding component automatically.
 */
const whistleComponents: IWhistlePlugin = async function whistleComponents(filename: string) {
  if (filename.match(/me-(.*)(\.css)/g)) {
    const target = filename
      .replace('/css', '/js')
      .replace('/dist', '')
      .replace('.css', '.ts');
    await esbuildWrapper({ target, outdir: 'www/js/dist' });
    return target;
  }
  return null;
};

const whistleJs: IWhistlePlugin = async function whistleJs(filename: string) {
  if (filename.match(/(\.ts)/g)) {
    await esbuildWrapper({ target: filename, outdir: 'www/js/dist' });
    return filename;
  }
  return null;
};

const whistleScss: IWhistlePlugin = async function whistleScss(filename: string) {
  if (filename.match(/(\.scss)/g)) {
    await sassWrapper({ target: filename, outdir: 'www/css/pages/dist' });
    return filename;
  }
  return null;
};

const whistleSsg: IWhistlePlugin = async function whistleSsg(filename: string) {
  if (filename.match(/(?![index])(\w+)\.html/g)) {
    switch (true) {
      case (filename.includes('www/html/blog')):
        await ssgWrapper({ filename, template: 'www/html/blog/template.html' });
        return filename;
      default:
        return null;
    }
  }
  return null;
};

const plugins: IWhistlePlugin[] = [
  whistleComponents,
  whistleJs,
  whistleScss,
  whistleSsg,
];

export default plugins;
