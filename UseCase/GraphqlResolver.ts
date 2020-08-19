import TodoListType from '../Domain/TodoListType.ts';
import TodoType from '../Domain/TodoType.ts';
import TodoListRepositoryType from '../Domain/TodoListRepositoryType.ts';
import TodoRepositoryType from '../Domain/TodoRepositoryType.ts';
import { GraphQLScalarType, Kind } from 'https://deno.land/x/oak_graphql/deps.ts';

// TODO: params should be validated

type ResolveType = { done: boolean };
const toResolveType = (p: Promise<any>): Promise<ResolveType> => {
  return p
    .then(() => ({ done: true }))
    .catch(() => ({ done: false }));
};

export default (
  todoListRepository: TodoListRepositoryType,
  todoRepository: TodoRepositoryType
) => ({

  Query: {
    getTodoList: (parent: any, { todoListId }: any, context: any, info: any): Promise<TodoListType | null> => {
      return todoListRepository
            .find(todoListId)
            .catch(() => null)
    },
    getTodo: (parent: any, { todoId }: any, context: any, info: any): Promise<TodoType | null> => {
      return todoRepository
        .find(todoId)
        .catch(() => null);
    },
  },

  Mutation: {
    // TODO: Type
    createTodoList: (parent: any, { input: { name } }: any, context: any, info: any): Promise<{ done: boolean }> => {
      return toResolveType(
        todoListRepository.create(name)
      );
    },
    // TODO: Type
    updateTodoList: (parent: any, { input: { todoListId, name } }: any, context: any, info: any): Promise<{ done: boolean }> => {
      return toResolveType(
        todoListRepository.update({ todoListId, name })
      );
    },
    // TODO: Type
    createTodo: (parent: any, { input: { todoListId, name, isFavorite, deadline } }: any, info: any): Promise<{ done: boolean }> => {
      return toResolveType(
        todoRepository.create({ todoListId, name, isFavorite, deadline })
      );
    },
    updateTodo: (parent: any, { input: { todoId, name, isFavorite, deadline } }: any, context: any, info: any): Promise<{ done: boolean }> => {
      return toResolveType(
        todoRepository.update({ todoId, name })
      );
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
});
