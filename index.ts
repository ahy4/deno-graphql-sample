import "https://cdn.pika.dev/@abraham/reflection@^0.7.0";

import { ServiceCollection } from 'https://deno.land/x/di@v0.1.1/mod.ts';

import StartServer from './Presentation/StartServer.ts';
import SyncDatabase from './UseCase/SyncDatabase.ts';
import GraphqlResolver from './UseCase/GraphqlResolver.ts';
import GraphqlService from './UseCase/GraphqlService.ts';
import config from './UseCase/SelectConfigByDenoEnv.ts';
import modelList, { modelListSymbol, ModelList } from './UseCase/ModelList.ts';
import TodoRepositoryType, { todoRepositorySymbol } from './Domain/TodoRepositoryType.ts';
import TodoRepository from './Infrastructure/TodoRepository.ts';
import TodoListRepositoryType, { todoListRepositorySymbol } from './Domain/TodoListRepositoryType.ts';
import TodoListRepository from './Infrastructure/TodoListRepository.ts';

const serviceCollection = new ServiceCollection();

serviceCollection.addTransient(StartServer);

serviceCollection.addTransient(GraphqlService);
serviceCollection.addTransient(GraphqlResolver);

serviceCollection.addTransient<TodoRepositoryType>(todoRepositorySymbol, TodoRepository);
serviceCollection.addTransient<TodoListRepositoryType>(todoListRepositorySymbol, TodoListRepository);

(Object.getOwnPropertySymbols(config) as Extract<keyof typeof config, symbol>[])
  .forEach((s) => {
    const conf = config[s];
    serviceCollection.addStatic<typeof conf>(s, conf);
  });

serviceCollection.addStatic<ModelList>(modelListSymbol, modelList);

serviceCollection.addTransient(SyncDatabase);

const startServer = serviceCollection.get(StartServer);
await startServer.run();
