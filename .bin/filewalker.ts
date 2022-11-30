import { join } from 'path';

interface IFilewalker {
  rootDir: string;
  pattern: RegExp;
  recursive?: boolean;
}

/**
 * filewalker()
 * This function will walk a directory looking for matching files.
 * @param {string} rootDir The directory to target.
 * @param {RegExp} pattern The pattern to match files against.
 * @param {boolean | undefined} recursive
 * Whether to recursively walk directories; true by default.
 * @returns {string[]}
 * An array of file paths that match the provided directory and pattern.
 */
export default async function filewalker({ rootDir, pattern, recursive = true }: IFilewalker) {
  let files: string[] = [];
  for await (const dirEntry of Deno.readDir(rootDir)) {
    if (dirEntry.isDirectory && recursive) {
      files = [...files, ...await filewalker({ rootDir: join(rootDir, dirEntry.name), pattern })];
    }
    if (dirEntry.isFile && dirEntry.name.match(pattern)) {
      files.push(join(rootDir, dirEntry.name));
    }
  }
  return files;
}
