import TodoListModel from '../Domain/TodoListModel.ts';
import TodoListHistoryModel from '../Domain/TodoListHistoryModel.ts';
import TodoListRepositoryType, {
  CreateTodoListArgument,
  UpdateTodoListArgument,
} from '../Domain/TodoListRepositoryType.ts';
import { RecordNotFoundException } from '../Domain/Exception.ts';
import TodoListType from '../Domain/TodoListType.ts';
import { Service } from 'https://deno.land/x/di@v0.1.1/mod.ts';

@Service()
export default class TodoListRepository implements TodoListRepositoryType {
  async find(todoListId: number): Promise<TodoListType> {
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
  }

  async create({ name }: CreateTodoListArgument): Promise<void> {
    // denodbにはトランザクションの機能ないけど、historyの作成だけ失敗したらどうするか？削除？
    console.log
    const { todoListId } = await TodoListModel.create({});
    await TodoListHistoryModel.create({ todoListId, name });
  }

  async update({ todoListId, name }: UpdateTodoListArgument): Promise<void> {
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
};
