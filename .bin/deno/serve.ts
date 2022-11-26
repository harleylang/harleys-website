import { serve } from 'server';
import { refresh } from 'refresh';
import { join } from 'path';
import yargs from 'yargs';

const __dirname = Deno.cwd();
const { port: __port = 3000 } = yargs(Deno.args).parse();

const middleware = refresh();

function composeResponse(req: Request): Response {
  try {
    const file = req.url.split(`:${__port}/`)[1] ?? 'index.html';
    const filePath = join(__dirname, 'www', file);

    let contentType = '';
    switch (true) {
      case file.includes('.mjs'):
      case file.includes('.js'):
        contentType = 'javascript';
        break;
      case file.includes('.css'):
        contentType = 'css';
        break;
      default:
        contentType = 'html';
    }

    let body = Deno.readTextFileSync(join(filePath));

    if (contentType === 'html') {
      body = body.replace(
        '<body>',
        '<body><script src="https://deno.land/x/refresh/client.js"></script>',
      );
    }

    return new Response(body, {
      headers: { 'Content-Type': `text/${contentType}` },
    });
  } catch (e) {
    console.warn({ req, e });
    return undefined as never as Response;
  }
}

serve(
  (req: Request) => {
    const res = middleware(req);
    if (res) {
      console.log(`... dev server reloaded`);
      return res;
    }
    return composeResponse(req);
  },
  { port: __port },
);

console.log(`Development server started...`);
console.log(`Listening on http://localhost:${__port}`);
