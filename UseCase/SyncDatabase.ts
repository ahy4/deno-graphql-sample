import { Database, Model } from 'https://deno.land/x/denodb/mod.ts';

export default (models: Array<typeof Model>, db: Database) => ({
  link: () => {
    db.link(models);
  },

  sync: async () => {
    db.link(models);

    // DB has foreign key constraint
    for (const model of models.concat().reverse()) {
      await model.drop();
    }

    // cannot create table when foreign key target does not exist
    for (const model of models) {
      await model.createTable();
    }
  }
});
