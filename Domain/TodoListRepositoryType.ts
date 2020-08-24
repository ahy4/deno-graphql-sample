import TodoListType from './TodoListType.ts'

export type CreateTodoListArgument = {
  name: string;
};

export type UpdateTodoListArgument = {
  todoListId: number;
  name?: string;
};

type TodoListRepositoryType = {
  find: (todoListId: number) => Promise<TodoListType>;
  create: (arg: CreateTodoListArgument) => Promise<void>;
  update: (arg: UpdateTodoListArgument) => Promise<void>;
};

export const todoListRepositorySymbol = Symbol('todoListRepositorySymbol');

export default TodoListRepositoryType;
