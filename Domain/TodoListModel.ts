import { DataTypes, Model } from 'https://deno.land/x/denodb/mod.ts';

export default class TodoListModel extends Model {
  static table = 'todo_lists';
  static timestamps = true;

  // 挿入前など、当然undefinedなことはあると思うけどsampleがこうしてしまってるので信頼してみる
  todoListId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static fields = {
    todoListId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  };
}
