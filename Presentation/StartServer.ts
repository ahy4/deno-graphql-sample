import { Application } from 'https://deno.land/x/oak/mod.ts';
import type { Router } from 'https://deno.land/x/oak/mod.ts';
import { Inject } from 'https://deno.land/x/di@v0.1.1/mod.ts';

export default class StartServer {

  constructor(private graphqlRouter: Router) {}

  run(): Promise<void> {
    console.log("Server start at http://localhost:8080");
    return new Application()
    .use(async (ctx, next) => {
      await next();
      const rt = ctx.response.headers.get("X-Response-Time");
      console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
    })
    .use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      ctx.response.headers.set("X-Response-Time", `${ms}ms`);
    })
    .use(this.graphqlRouter.routes(), this.graphqlRouter.allowedMethods())
    .listen({ port: 8080 });
  }
}
