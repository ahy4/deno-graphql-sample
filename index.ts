import { Application } from "https://deno.land/x/oak/mod.ts";
import { applyGraphQL, gql, GQLError } from "https://deno.land/x/oak_graphql/mod.ts";
import { DataTypes, Database, Model } from 'https://deno.land/x/denodb/mod.ts';

const app = new Application();

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

const postgresUrl = Deno.env.get('DATABASE_URL') ?? '';
const parsedUrl = new URL(postgresUrl);
const db = new Database('postgres', {
  host: parsedUrl.hostname,
  port: Number(parsedUrl.port),
  username: parsedUrl.username,
  password: parsedUrl.password,
  database: parsedUrl.pathname.slice(1) // remove first slash
});

class TodoList extends Model {
  static table = 'todo_lists';
  static timestamps = true;

  // 当然undefinedなことはあると思うけどsampleがこうしてしまってるので信頼してみる
  id!: number;
  name!: string;

  static fields = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.string(65535)
  };
}

db.link([TodoList]);
await db.sync({ drop: false });

// 本家のgraphqlのほうのdenoブランチが壊れてる関係で、type importがまだoak_graphqlにない。
// だからそれまではgql as anyか自前で型定義を書いて我慢しよう。
// 参考資料:
// もともとの型定義 https://github.com/apollographql/graphql-tag/blob/v2.10.3/index.d.ts
// graphql-jsのdenoブランチの型定義が壊れてる https://github.com/graphql/graphql-js/blob/deno/index.d.ts
// oak_graphqlはそれを読もうとしてうまくいかなかったのでやめてる https://github.com/aaronwlee/Oak-GraphQL/blob/master/deps.ts
const types = (gql as any)`
type TodoList {
  id: Int
  name: String
}

# type Todo {
#   id: Int
#   todoListId: Int
#   name: String
#   isFavorite: Boolean
# }

input CreateTodoListInput {
  name: String
}

type ResolveType {
  done: Boolean
}

type Query {
  getTodoList(id: Int): TodoList
#  getTodo(id: Int): Todo
}

type Mutation {
  createTodoList(input: CreateTodoListInput!): ResolveType!
}
`;

const resolvers = {
  Query: {
    getTodoList: (parent: any, { id }: any, context: any, info: any): Promise<TodoList> => {
      return TodoList.find(id);
    },
  },
  Mutation: {
    createTodoList: async (parent: any, { input: { name } }: any, context: any, info: any): Promise<{ done: boolean }> => {
      console.log("input:", name);
      try {
        await TodoList.create({ name });
        return { done: true }
      } catch {
        return { done: false }
      }
    },
  },
};

const GraphQLService = await applyGraphQL({
  typeDefs: types,
  resolvers: resolvers,
  context: (ctx) => {
    return {};
  }
})

app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

console.log("Server start at http://localhost:8080");
await app.listen({ port: 8080 });
