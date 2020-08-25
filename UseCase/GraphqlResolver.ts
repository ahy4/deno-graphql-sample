import TodoListType from '../Domain/TodoListType.ts';
import TodoType from '../Domain/TodoType.ts';
import TodoListRepositoryType, { todoListRepositorySymbol } from '../Domain/TodoListRepositoryType.ts';
import TodoRepositoryType, { todoRepositorySymbol } from '../Domain/TodoRepositoryType.ts';
import { GraphQLScalarType, Kind } from 'https://deno.land/x/oak_graphql/deps.ts';
import { Service, Inject } from 'https://deno.land/x/di@v0.1.1/mod.ts';

// TODO: params should be validated

type ResolveType = { done: boolean };
const toResolveType = (p: Promise<any>): Promise<ResolveType> => p
  .then(() => ({ done: true }))
  .catch((e) => {
    console.warn(e);
    console.warn(e.stack);
    return { done: false }
  });

@Service()
export default class GraphqlResolver {
  constructor(
    @Inject(todoListRepositorySymbol) private readonly todoListRepository: TodoListRepositoryType,
    @Inject(todoRepositorySymbol) private readonly todoRepository: TodoRepositoryType,
  ) {}

  getTodoList(parent: any, { todoListId }: any, context: any, info: any): Promise<TodoListType | null> {
    return this.todoListRepository
      .find(todoListId)
      .catch(() => null)
  }

  getTodo(parent: any, { todoId }: any, context: any, info: any): Promise<TodoType | null> {
    return this.todoRepository
      .find(todoId)
      .catch(() => null);
  }

  createTodoList(parent: any, { input: { name } }: any, context: any, info: any): Promise<ResolveType> {
    return toResolveType(
      this.todoListRepository.create({ name })
    );
  }

  updateTodoList(parent: any, { input: { todoListId, name } }: any, context: any, info: any): Promise<ResolveType> {
    return toResolveType(
      this.todoListRepository.update({ todoListId, name })
    );
  }

  createTodo(parent: any, { input: { todoListId, name, isFavorite, deadline } }: any, info: any): Promise<ResolveType> {
    return toResolveType(
      this.todoRepository.create({ todoListId, name, isFavorite, deadline })
    );
  }

  updateTodo(parent: any, { input: { todoId, name, isFavorite, deadline } }: any, context: any, info: any): Promise<ResolveType> {
    return toResolveType(
      this.todoRepository.update({ todoId, name })
    );
  }

  createDateScalarParser(): any {
    return new (GraphQLScalarType as any)({
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
    });
  }
}
