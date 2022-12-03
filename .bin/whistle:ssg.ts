import ssgWrapper from './wrapper:ssg.ts';
import { IWhistleEffect } from './filewhistler.ts';

const whistleSsg: IWhistleEffect = async function whistleSsg(filename: string) {
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

export default whistleSsg;
