interface IWatch {
  directory: string;
  events?: Deno.FsEvent['kind'][];
  pattern?: RegExp;
  callback: (file: string) => Promise<void>;
  recursive?: boolean;
}

/**
 * watch()
 * This function uses the Deno.watchFs() method + debouncing
 * to re-rerun a provided function.
 * @param {string} directory The target directory to watch.
 * @param {Deno.FsEvent.kind[] | undefined} events
 * The type of event(s) to listen to. ["create", "modify"] by default.
 * @param {RegExp | undefined} pattern
 * The file pattern to match for the callback to fire.
 * @param {(filename: string) => Promise<void>} callback
 * @param {boolean | undefined} recursive
 * Whether to watch recursive directories; true by default.
 * The callback function fired when observing a matching file / event.
 */
export default async function filewatcher(
  { directory, events = ['create', 'modify'], pattern, callback, recursive = true }: IWatch,
): Promise<void> {
  const watcher = Deno.watchFs(directory, { recursive });
  const notifiers = new Map<string, number>();
  for await (const event of watcher) {
    const dataString = JSON.stringify(event);
    if (notifiers.has(dataString)) {
      clearTimeout(notifiers.get(dataString));
      notifiers.delete(dataString);
    }

    notifiers.set(
      dataString,
      setTimeout(async () => {
        // Send notification here
        notifiers.delete(dataString);
        if (events.includes(event.kind)) {
          for (const filename of event.paths) {
            if (pattern) {
              if (filename.match(pattern)) await callback(filename);
            } else {
              await callback(filename);
            }
          }
        }
      }, 200),
    );
  }
}
