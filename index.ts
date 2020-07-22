import { serve } from "https://deno.land/std/http/server.ts";
import { readFileStr } from 'https://deno.land/std/fs/read_file_str.ts';
import { CasualDB } from "https://deno.land/x/casualdb@v0.1.2/mod.ts";

// create an interface to describe the structure of your JSON
type Schema = {
  posts: Array<{
    id: number;
    title: string;
    views: number;
  }>;
  user: {
    name: string;
  };
}

const db = new CasualDB<Schema>();

await db.connect("./db.json");

// (optional) seed it with data, if starting with an empty db
const defaultData = await readFileStr("./db-default.json");
await db.seed(JSON.parse(defaultData));

const server = serve({ port: 8000 });

for await (const req of server) {
  const posts = await db.get<Schema['posts']>('posts'); // pass the interface key in order for type-checking to work
  const postTitlesByViews = posts
    .sort(['views']) // sort by views (ascending)
    .pick(['title']) // pick the title of every post
    .value(); // => ['Post 2', 'Post 1']
  req.respond({
    body: JSON.stringify(postTitlesByViews, null, "  ") + '\n'
  });
}
