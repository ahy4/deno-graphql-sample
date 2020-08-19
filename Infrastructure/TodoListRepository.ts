import TodoModel from '../Domain/TodoModel.ts';
import TodoHistoryModel from '../Domain/TodoHistoryModel.ts';
import TodoRepositoryType from '../Domain/TodoRepositoryType.ts';
import { RecordNotFoundException } from '../Domain/Exception.ts';
import { dropNullableField } from '../Domain/ObjectHelper.ts';

export default (): TodoRepositoryType => ({
  find: async (todoId) => {
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
  },

  create: async ({ todoListId, name, isFavorite, deadline }) => {
    const { todoId } = await TodoModel.create({ todoListId });
    const createRecordParams = {
      todoId,
      name,
      isFavorite,
      deadline
    };
    await TodoHistoryModel.create(dropNullableField(createRecordParams));
  },

  update: async ({ todoId, name, isFavorite, deadline }) => {
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
  },
});
