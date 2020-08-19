import TodoListModel from '../Domain/TodoListModel.ts';
import TodoListHistoryModel from '../Domain/TodoListHistoryModel.ts';
import TodoListRepositoryType from '../Domain/TodoListRepositoryType.ts';
import { RecordNotFoundException } from '../Domain/Exception.ts';

export default (): TodoListRepositoryType => ({
  find: async (todoListId) => {
    const todoList: TodoListModel | undefined = await TodoListModel.find(todoListId);
    const todoListHistory: TodoListHistoryModel | undefined = await TodoListHistoryModel
      .where('todoListId', todoListId)
      .orderBy('todoListHistoryId', 'desc')
      .first();

    if (!todoList) {
      throw new RecordNotFoundException(`couldn't find master todolist. todoListId: ${todoListId}`);
    }
    if (!todoListHistory) {
      throw new RecordNotFoundException(`couldn't find todolist history. todoListId: ${todoListId}`);
    }
    return {
      todoListId: todoList.todoListId,
      name: todoListHistory.name,
      createdAt: todoList.createdAt,
      updatedAt: todoListHistory.createdAt,
    };
  },

  create: async ({ name }) => {
    const { todoListId } = await TodoListModel.create({});
    await TodoListHistoryModel.create({ todoListId, name });
  },

  update: async ({ todoListId, name }) => {
    const previousTodoListHistory = await TodoListHistoryModel
      .where('todoListId', todoListId)
      .orderBy('todoListHistoryId', 'desc')
      .first();
    if (!previousTodoListHistory) {
      throw new RecordNotFoundException(`couldn't find todolist history. todoListId: ${todoListId}`);
    }
    await TodoListHistoryModel.create({
      todoListId,
      name: name ?? previousTodoListHistory.name,
    });
  }
});
