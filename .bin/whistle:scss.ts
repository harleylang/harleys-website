import sassWrapper from './wrapper:sass.ts';
import { IWhistleEffect } from './filewhistler.ts';

const whistleScss: IWhistleEffect = async function whistleScss(filename: string) {
  if (filename.match(/(\.scss)/g)) {
    await sassWrapper({ target: filename, outdir: 'www/css/dist' });
    return filename;
  }
  return null;
};

export default whistleScss;
