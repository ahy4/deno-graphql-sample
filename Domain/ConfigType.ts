export type PostgresConfigType = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export type RefreshDatabaseType = boolean;

export type WebserverConfigType = {
  port: number;
};
