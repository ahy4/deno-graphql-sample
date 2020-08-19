import TodoType from './TodoType.ts'

export type CreateTodoArgument = {
  todoListId: number;
  name: string;
  isFavorite?: boolean;
  deadline?: Date;
};

export type UpdateTodoArgument = {
  todoId: number;
  name?: string;
  isFavorite?: boolean;
  deadline?: Date;
};

type TodoRepositoryType = {
  find: (todoListId: number) => Promise<TodoType>;
  create: (arg: CreateTodoArgument) => Promise<void>;
  update: (arg: UpdateTodoArgument) => Promise<void>;
};

export default TodoRepositoryType;
