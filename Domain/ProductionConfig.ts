import {
  PostgresConfigType,
  RefreshDatabaseType,
} from './ConfigType.ts';

type Production<T> = {
  type: 'production';
  config: T;
};

export type GetProduction<T> = () => Production<T>;

const createProductionConfig = <T> (getConfig: () => T): GetProduction<T> => () => ({
  type: 'production',
  config: getConfig(),
});

export const getPostgresConfig = createProductionConfig<PostgresConfigType>(() => {
  const postgresUrl = Deno.env.get('DATABASE_URL') ?? '';
  const parsedUrl = new URL(postgresUrl);
  return {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port),
    username: parsedUrl.username,
    password: parsedUrl.password,
    database: parsedUrl.pathname.slice(1), // remove first slash
  };
});

export const getRefreshDatabase = createProductionConfig<RefreshDatabaseType>(() => true);
