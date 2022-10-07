/**
 * args.js -- a helper script for deriving args passed to a node script
 * @param {string[]} args The arguments to derive.
 */

export default function args(args) {
  const rawargs = process.argv;
  const argObj = {};
  for (let a = 0; a < rawargs.length; a += 1) {
    const arg = rawargs[a];
    if (arg.includes("--")) {
      const key = arg.split("--")[1];
      const val = rawargs[a + 1];
      a += 1;
      argObj[key] = val;
    }
  }
  if (Array.isArray(args)) {
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (typeof arg !== "string")
        throw new Error(
          `ERROR: arg "${arg}" is not type string; received: ${typeof arg}`
        );
      if (typeof argObj[arg] === "undefined")
        throw new Error(`ERROR: missing arg ${arg}`);
    }
  }
  return argObj;
}