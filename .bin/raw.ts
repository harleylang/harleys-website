/**
 * raw()
 * This function gets the raw content of each file in an array.
 * @param filenames The files to read.
 * @returns {object} Filename-key and raw-value object.
 */
async function raw(filenames: string[]) {
  // create an object of filenames and their raw content
  let content: { [key: string]: string } = {};

  // populate the moduleContent object with file paths and their content
  for (const filename of filenames) {
    const raw = await Deno.readTextFile(filename);
    content = { ...content, [filename]: raw };
  }

  return content;
}

export default raw;
