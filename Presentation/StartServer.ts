import { Application } from 'https://deno.land/x/oak/mod.ts';
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { Service, Inject } from 'https://deno.land/x/di@v0.1.1/mod.ts';
import GraphqlService from '../UseCase/GraphqlService.ts';
import SyncDatabase from '../UseCase/SyncDatabase.ts';
import { RefreshDatabaseType, WebserverConfigType } from '../Domain/ConfigType.ts';
import { refreshDatabaseSymbol, webserverConfigSymbol } from '../UseCase/SelectConfigByDenoEnv.ts'

@Service()
export default class StartServer {

  constructor(
    @Inject(GraphqlService) private readonly graphqlService: GraphqlService,
    @Inject(SyncDatabase) private readonly syncDatabase: SyncDatabase,
    @Inject(refreshDatabaseSymbol) private readonly refreshDatabase: RefreshDatabaseType,
    @Inject(webserverConfigSymbol) private readonly webserverConfig: WebserverConfigType,
  ) {}

  async run(): Promise<void> {
    console.log("Server start at http://localhost:8080");

    this.syncDatabase.link();
    if (this.refreshDatabase) {
      this.syncDatabase.sync();
    }

    await this.createApiStream();
  }

  private async createApiStream(): Promise<void> {
    const graphqlRouter = await this.graphqlService.getRouter();
    return new Application()
      .use(async (ctx: any, next: any) => {
        await next();
        const rt = ctx.response.headers.get("X-Response-Time");
        console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
      })
      .use(async (ctx: any, next: any) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        ctx.response.headers.set("X-Response-Time", `${ms}ms`);
      })
      .use(oakCors())
      .use(graphqlRouter.routes(), graphqlRouter.allowedMethods())
      .listen({ port: this.webserverConfig.port });
  }
}
