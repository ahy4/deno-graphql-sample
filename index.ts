import { Application, Router, RouterContext } from 'https://deno.land/x/oak/mod.ts';
import { applyGraphQL, gql, GQLError } from 'https://deno.land/x/oak_graphql/mod.ts';
import { GraphQLScalarType, Kind } from 'https://deno.land/x/oak_graphql/deps.ts';
import { DataTypes, Database, Model, Relationships } from 'https://deno.land/x/denodb/mod.ts';

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
  database: parsedUrl.pathname.slice(1), // remove first slash
});

class TodoListModel extends Model {
  static table = 'todo_lists';
  static timestamps = true;

  // 挿入前など、当然undefinedなことはあると思うけどsampleがこうしてしまってるので信頼してみる
  todoListId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static fields = {
    todoListId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  };
}

class TodoListHistoryModel extends Model {
  static table = 'todo_list_histories';
  static timestamps = true;

  todoListHistoryId!: number;
  todoListId!: number;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static fields = {
    todoListHistoryId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    todoListId: Relationships.belongsTo(TodoListModel),
    name: DataTypes.string(65535),
  };
}

class TodoModel extends Model {
  static table = 'todos';
  static timestamps = true;

  todoId!: number;
  todoListId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static fields = {
    todoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    todoListId: Relationships.belongsTo(TodoListModel),
  };
}

class TodoHistoryModel extends Model {
  static table = 'todo_histories';
  static timestamps = true;

  todoHistoryId!: number;
  todoId!: number;
  name!: string;
  isFavorite!: boolean;
  deadline!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  static fields = {
    todoHistoryId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    todoId: Relationships.belongsTo(TodoModel),
    name: DataTypes.string(65535),
    isFavorite: DataTypes.BOOLEAN,
    deadline: DataTypes.DATETIME,
  };

  static defaults = {
    isFavorite: false,
    deadline: '9999-12-31 23:59:59',
  };
}

const models = [
  TodoListModel,
  TodoListHistoryModel,
  TodoModel,
  TodoHistoryModel,
];
db.link(models);
for (const model of models.concat().reverse()) {
  await model.drop();
}
for (const model of models) {
  await model.createTable();
}

const types = gql`
scalar Date

type ResolveType {
  done: Boolean
}

type TodoList {
  todoListId: Int
  name: String
  createdAt: Date
  updatedAt: Date
}

type Todo {
  todoId: Int
  todoListId: Int
  name: String
  isFavorite: Boolean
  deadline: Date
  createdAt: Date
  updatedAt: Date
}

input CreateTodoListInput {
  name: String!
}

input UpdateTodoListInput {
  todoListId: Int!
  name: String
}

input CreateTodoInput {
  todoListId: Int!
  name: String!
  isFavorite: Boolean
  deadline: Date
}

input UpdateTodoInput {
  todoId: Int!
  name: String
  isFavorite: Boolean
  deadline: Date
}

type Query {
  getTodoList(todoListId: Int): TodoList
  getTodo(todoId: Int): Todo
}

type Mutation {
  createTodoList(input: CreateTodoListInput!): ResolveType!
  updateTodoList(input: UpdateTodoListInput!): ResolveType!
  createTodo(input: CreateTodoInput!): ResolveType!
  updateTodo(input: UpdateTodoInput!): ResolveType!
}
`;

type TodoList = {
  todoListId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type Todo = {
  todoId: number;
  todoListId: number;
  name: string;
  isFavorite: boolean;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
};

const resolvers = {
  Query: {
    getTodoList: async (parent: any, { todoListId }: any, context: any, info: any): Promise<TodoList | null> => {
      const todoList: TodoListModel | undefined = await TodoListModel.find(todoListId);
      const todoListHistory: TodoListHistoryModel | undefined = await TodoListHistoryModel
        .where('todoListId', todoListId)
        .orderBy('todoListHistoryId', 'desc')
        .first();

      if (!todoList || !todoListHistory) {
        return null;
      }
      return {
        todoListId: todoList.todoListId,
        name: todoListHistory.name,
        createdAt: todoList.createdAt,
        updatedAt: todoListHistory.createdAt,
      };
    },
    getTodo: async (parent: any, { todoId }: any, context: any, info: any): Promise<Todo | null> => {
      const todo: TodoModel | undefined = await TodoModel.find(todoId);
      const todoHistory: TodoHistoryModel | undefined = await TodoHistoryModel
        .where('todoId', todoId)
        .orderBy('todoHistoryId', 'desc')
        .first();

      if (!todo || !todoHistory) {
        return null;
      }
      return {
        todoId: todo.todoId,
        todoListId: todo.todoListId,
        name: todoHistory.name,
        isFavorite: todoHistory.isFavorite,
        deadline: todoHistory.deadline,
        createdAt: todo.createdAt,
        updatedAt: todoHistory.createdAt,
      };
    },
  },
  Mutation: {
    // TODO: Type
    createTodoList: async (parent: any, { input: { name } }: any, context: any, info: any): Promise<{ done: boolean }> => {
      try {
        const { todoListId } = await TodoListModel.create({});
        await TodoListHistoryModel.create({ todoListId, name });
        return { done: true };
      } catch (e) {
        console.log(e);
        return { done: false };
      }
    },
    // TODO: Type
    updateTodoList: async (parent: any, { input: { todoListId, name } }: any, context: any, info: any): Promise<{ done: boolean }> => {
      try {
        const previousTodoListHistory = await TodoListHistoryModel
          .where('todoListId', todoListId)
          .orderBy('todoListHistoryId', 'desc')
          .first();
        if (!previousTodoListHistory) {
          return { done: false };
        }
        await TodoListHistoryModel.create({
          todoListId,
          name: name ?? previousTodoListHistory.name,
        });
        return { done: true };
      } catch (e) {
        return { done: false };
      }
    },
    // TODO: Type
    createTodo: async (parent: any, { input: { todoListId, name, isFavorite, deadline } }: any, info: any): Promise<{ done: boolean }> => {
      try {
        const { todoId } = await TodoModel.create({ todoListId });
        await TodoHistoryModel.create({ todoId, name, isFavorite, deadline });
        return { done: true };
      } catch (e) {
        console.log(e);
        return { done: false };
      }
    },
    updateTodo: async (parent: any, { input: { todoListId, name } }: any, context: any, info: any): Promise<{ done: boolean }> => {
      return { done: false };
    },
  },
  Date: new (GraphQLScalarType as any)({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value: any) {
      return new Date(value); // value from the client
    },
    serialize(value: any) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast: any) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
};

const GraphQLService = await applyGraphQL<Router>({
  typeDefs: types,
  resolvers: resolvers,
  context: (ctx: RouterContext) => {
    return {};
  },
  Router,
});

app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

console.log("Server start at http://localhost:8080");
await app.listen({ port: 8080 });
