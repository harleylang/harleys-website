import esbuildWrapper from './wrapper:esbuild.ts';
import { IWhistleEffect } from './filewhistler.ts';

const whistleJs: IWhistleEffect = async function whistleJs(filename: string) {
  if (filename.match(/(\.ts)/g)) {
    await esbuildWrapper({ target: filename, outdir: 'www/js/dist' });
    return filename;
  }
  return null;
};

export default whistleJs;
