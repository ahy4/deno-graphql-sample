import {
  PostgresConfigType,
  RefreshDatabaseType,
  WebserverConfigType,
} from '../Domain/ConfigType.ts';
import * as production from '../Domain/ProductionConfig.ts';
import * as development from '../Domain/DevelopmentConfig.ts';

import { EnvVariableNotSatisfiedException } from '../Domain/Exception.ts';

export const postgresConfigSymbol = Symbol('postgresConfig');
export const refreshDatabaseSymbol = Symbol('refreshDatabase');
export const webserverConfigSymbol = Symbol('webserverConfig');

const selectConfig = <T> (
  getProductionConfig: production.GetProduction<T>,
  getDevelopmentConfig: development.GetDevelopment<T>
): T => {
  const denoEnv = Deno.env.get('DENO_ENV') ?? '';
  switch (denoEnv) {
    case 'production': return getProductionConfig().config;
    case 'development': return getDevelopmentConfig().config;
    default: throw new EnvVariableNotSatisfiedException('couldn\'t get DENO_ENV.');
  }
};

const postgresConfig = selectConfig<PostgresConfigType>(
  production.getPostgresConfig,
  development.getPostgresConfig,
);

const refreshDatabase = selectConfig<RefreshDatabaseType>(
  production.getRefreshDatabase,
  development.getRefreshDatabase,
);

const webserverConfig = selectConfig<WebserverConfigType>(
  production.getWebserberConfig,
  development.getWebserberConfig,
);

export default {
  [postgresConfigSymbol]: postgresConfig,
  [refreshDatabaseSymbol]: refreshDatabase,
  [webserverConfigSymbol]: webserverConfig,
};
