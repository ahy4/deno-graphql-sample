import TodoListModel from '../Domain/TodoListModel.ts';
import TodoListHistoryModel from '../Domain/TodoListHistoryModel.ts';
import TodoModel from '../Domain/TodoModel.ts';
import TodoHistoryModel from '../Domain/TodoHistoryModel.ts';
import { Model } from 'https://deno.land/x/denodb/mod.ts';

export const modelListSymbol = Symbol('modelList');
export type ModelList = Array<typeof Model>;

// create tableする順番で定義する
const modelList: ModelList = [
  TodoListModel,
  TodoListHistoryModel,
  TodoModel,
  TodoHistoryModel,
];

export default modelList;
