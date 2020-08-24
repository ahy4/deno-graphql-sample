import TodoModel from '../Domain/TodoModel.ts';
import TodoHistoryModel from '../Domain/TodoHistoryModel.ts';
import TodoRepositoryType, {
  CreateTodoArgument,
  UpdateTodoArgument,
} from '../Domain/TodoRepositoryType.ts';
import TodoType from '../Domain/TodoType.ts';
import { RecordNotFoundException } from '../Domain/Exception.ts';
import { dropNullableField } from '../Domain/ObjectHelper.ts';
import { Service } from 'https://deno.land/x/di@v0.1.1/mod.ts';

@Service()
export default class TodoRepository implements TodoRepositoryType {
  async find(todoId: number): Promise<TodoType> {
    const todo: TodoModel | undefined = await TodoModel.find(todoId);
    const todoHistory: TodoHistoryModel | undefined = await TodoHistoryModel
      .where('todoId', todoId)
      .orderBy('todoHistoryId', 'desc')
      .first();

    if (!todo) {
      throw new RecordNotFoundException(`couldn't find master todo. todoId: ${todoId}`);
    }
    if (!todoHistory) {
      throw new RecordNotFoundException(`couldn't find todo history. todoId: ${todoId}`);
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
  }

  async create({ todoListId, name, isFavorite, deadline }: CreateTodoArgument): Promise<void> {
    const { todoId } = await TodoModel.create({ todoListId });
    const createRecordParams = {
      todoId,
      name,
      isFavorite,
      deadline
    };
    await TodoHistoryModel.create(dropNullableField(createRecordParams));
  }

  async update({ todoId, name, isFavorite, deadline }: UpdateTodoArgument): Promise<void> {
    const previousTodoHistory = await TodoHistoryModel
      .where('todoId', todoId)
      .orderBy('todoHistoryId', 'desc')
      .first();
    if (!previousTodoHistory) {
      throw new RecordNotFoundException(`couldn't find todo history. todoId: ${todoId}`);
    }
    await TodoHistoryModel.create({
      todoId,
      name: name ?? previousTodoHistory.name,
      isFavorite: isFavorite ?? previousTodoHistory.isFavorite,
      deadline: deadline ?? previousTodoHistory.deadline,
    });
  }
}
