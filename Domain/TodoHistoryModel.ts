import { DataTypes, Model, Relationships } from 'https://deno.land/x/denodb/mod.ts';
import TodoModel from './TodoModel.ts'

export default class TodoHistoryModel extends Model {
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
