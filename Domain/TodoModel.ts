import { DataTypes, Model, Relationships } from 'https://deno.land/x/denodb/mod.ts';
import TodoListModel from './TodoListModel.ts'

export default class TodoModel extends Model {
  static table = 'todos';
  static timestamps = true;

  todoId!: number;
  todoListId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static fields = {
    todoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    todoListId: Relationships.belongsTo(TodoListModel),
  };
}
