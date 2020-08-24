import { Database } from 'https://deno.land/x/denodb/mod.ts';
import { Service, Inject } from 'https://deno.land/x/di@v0.1.1/mod.ts';
import { PostgresConfigType } from '../Domain/ConfigType.ts'
import { postgresConfigSymbol } from '../UseCase/SelectConfigByDenoEnv.ts';
import { DatabaseNotLinkedException } from '../Domain/Exception.ts';
import { modelListSymbol, ModelList } from '../UseCase/ModelList.ts';

@Service()
export default class SyncDatabase {

  private db: Database;
  private isLinkCalled = false;

  constructor(
    @Inject(modelListSymbol) private readonly modelList: ModelList,
    @Inject(postgresConfigSymbol) private readonly postgresConfig: PostgresConfigType,
  ) {
    this.db = new Database('postgres', this.postgresConfig);
  }

  link(): void {
    this.db.link(this.modelList);
    this.isLinkCalled = true;
  }

  async sync(): Promise<void> {
    if (!this.isLinkCalled) {
      throw new DatabaseNotLinkedException();
    }

    // DB has foreign key constraint
    for (const model of this.modelList.concat().reverse()) {
      await model.drop();
    }

    // cannot create table when foreign key target does not exist
    for (const model of this.modelList) {
      await model.createTable();
    }
  }

}
