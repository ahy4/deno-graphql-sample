import { DataTypes, Model, Relationships } from 'https://deno.land/x/denodb/mod.ts';
import TodoListModel from './TodoListModel.ts'

export default class TodoListHistoryModel extends Model {
  static table = 'todo_list_histories';
  static timestamps = true;

  todoListId!: number;
  name!: string;
  todoListHistoryId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static fields = {
    todoListHistoryId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    todoListId: Relationships.belongsTo(TodoListModel),
    name: DataTypes.string(65535),
  };
};
