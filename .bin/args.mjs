export default function argLoader(args) {
  const rawargs = process.argv.filter((v) => v.includes("="));
  const argObj = {};
  for (let a = 0; a < rawargs.length; a += 1) {
    const [key, val] = rawargs[a].split("=");
    argObj[key] = val;
  }
  if (Array.isArray(args)) {
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (typeof arg !== "string")
        throw new Error(
          `ERROR: arg "${arg}" is not type string; received: ${typeof arg}`
        );
      if (typeof argObj[arg] === "undefined")
        throw new Error('ERROR: missing arg "element"');
    }
  }
  return argObj;
}
