import { serve } from "https://deno.land/std@0.119.0/http/server.ts";
import {
  dirname,
  fromFileUrl,
  join,
} from "https://deno.land/std@0.119.0/path/mod.ts";
import { refresh } from "https://deno.land/x/refresh/mod.ts";
import yargs from "https://deno.land/x/yargs@v17.6.2-deno/deno.ts";

const __dirname = Deno.cwd();
const { port: __port = 3000 } = yargs(Deno.args).argv;

const middleware = refresh();

function composeResponse(req) {
  try {
    const file = req.url.split(`:${__port}/`)[1] ?? "index.html";
    const filePath = join(__dirname, "www", file);

    let contentType = "";
    switch (true) {
      case file.includes(".mjs"):
      case file.includes(".js"):
        contentType = "javascript";
        break;
      case file.includes(".css"):
        contentType = "css";
        break;
      default:
        contentType = "html";
    }

    let body = Deno.readTextFileSync(join(filePath));

    if (contentType === "html")
      body = body.replace(
        "<body>",
        '<body><script src="https://deno.land/x/refresh/client.js"></script>'
      );

    return new Response(body, {
      headers: { "Content-Type": `text/${contentType}` },
    });
  } catch (e) {
    console.warn({ req, e });
  }
}

serve(
  (req: Request) => {
    const res = middleware(req);
    if (res) return res;
    return composeResponse(req);
  },
  { port: __port }
);

console.log(`Development server started...`);
console.log(`Listening on http://localhost:${__port}`);
