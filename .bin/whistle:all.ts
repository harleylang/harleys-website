import { IWhistleEffect } from './filewhistler.ts';

import whistleComponents from './whistle:components.ts';
import whistleJs from './whistle:js.ts';
import whistleScss from './whistle.scss.ts';
import whistleSsg from './whistle:ssg.ts';

const whistles: IWhistleEffect[] = [
  whistleComponents,
  whistleJs,
  whistleScss,
  whistleSsg,
];

export default whistles;
