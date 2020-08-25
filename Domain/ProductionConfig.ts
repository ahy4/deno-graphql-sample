import {
  PostgresConfigType,
  RefreshDatabaseType,
  WebserverConfigType,
} from './ConfigType.ts';
import { EnvVariableNotSatisfiedException } from './Exception.ts'

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
  const postgresUrl = Deno.env.get('DATABASE_URL');
  if (!postgresUrl) {
    throw new EnvVariableNotSatisfiedException('couldn\'t get DATABASE_URL.');
  }
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

export const getWebserberConfig = createProductionConfig<WebserverConfigType>(() => {
  const port = Deno.env.get('PORT');
  if (!port) {
    throw new EnvVariableNotSatisfiedException('couldn\'t get PORT.');
  }
  return {
    port: parseInt(port)
  };
});
