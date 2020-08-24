import {
  PostgresConfigType,
  RefreshDatabaseType,
} from './ConfigType.ts';

type Development<T> = {
  type: 'development';
  config: T;
};

export type GetDevelopment<T> = () => Development<T>;

const createDevelopmentConfig = <T> (getConfig: () => T): GetDevelopment<T> => () => ({
  type: 'development',
  config: getConfig(),
});

export const getPostgresConfig = createDevelopmentConfig<PostgresConfigType>(() => {
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

export const getRefreshDatabase = createDevelopmentConfig<RefreshDatabaseType>(() => true);
