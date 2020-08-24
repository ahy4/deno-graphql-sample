import {
  PostgresConfigType,
  RefreshDatabaseType,
} from '../Domain/ConfigType.ts';
import * as production from '../Domain/ProductionConfig.ts';
import * as development from '../Domain/DevelopmentConfig.ts';

import { DenoEnvNotSetException } from '../Domain/Exception.ts';

export const postgresConfigSymbol = Symbol('postgresConfig');
export const refreshDatabaseSymbol = Symbol('refreshDatabase');

const selectConfig = <T> (
  getProductionConfig: production.GetProduction<T>,
  getDevelopmentConfig: development.GetDevelopment<T>
): T => {
  const denoEnv = Deno.env.get('DENO_ENV') ?? '';
  switch (denoEnv) {
    case 'production': return getProductionConfig().config;
    case 'development': return getDevelopmentConfig().config;
    default: throw new DenoEnvNotSetException();
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

export default {
  [postgresConfigSymbol]: postgresConfig,
  [refreshDatabaseSymbol]: refreshDatabase,
};
