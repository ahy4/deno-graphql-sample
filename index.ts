import { readFileStr } from 'https://deno.land/std/fs/read_file_str.ts';
import { CasualDB } from "https://deno.land/x/casualdb@v0.1.2/mod.ts";
import { Application } from "https://deno.land/x/oak/mod.ts";
import { applyGraphQL, gql, GQLError } from "https://deno.land/x/oak_graphql/mod.ts";

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

// create an interface to describe the structure of your JSON
type Schema = {
  TodoList: Array<{
    id: number;
    name: string;
  }>;
}

const db = new CasualDB<Schema>();

await db.connect("./db.json");

// (optional) seed it with data, if starting with an empty db
const defaultData = await readFileStr("./db-default.json");
await db.seed(JSON.parse(defaultData));

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
# 
# input CreateTodoListInput {
#   firstName: String
#   lastName: String
# }
# 
# type ResolveType {
#   done: Boolean
# }

type Query {
  getTodoList(id: Int): TodoList
#  getTodo(id: Int): Todo
}

# type Mutation {
#   createTodoList(input: CreateTodoListInput!): ResolveType!
# }
`;

const resolvers = {
  Query: {
    getTodoList: async (parent: any, { id }: any, context: any, info: any): Promise<Schema["TodoList"] | null> => {

      const todoLists = await db.get<Schema['TodoList']>('TodoList'); // pass the interface key in order for type-checking to work
      return todoLists.findOne({ id }).value() as Schema["TodoList"] | null; // maybe it is type def bug
    },
  },
  // Mutation: {
  //   setUser: (parent: any, { input: { firstName, lastName } }: any, context: any, info: any) => {
  //     console.log("input:", firstName, lastName);
  //     return {
  //       done: true,
  //     };
  //   },
  // },
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
