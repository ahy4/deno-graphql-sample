export type PostgresConfigType = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

const postgresUrl = Deno.env.get('DATABASE_URL') ?? '';
const parsedUrl = new URL(postgresUrl);

const postgresConfig: PostgresConfigType = {
  host: parsedUrl.hostname,
  port: Number(parsedUrl.port),
  username: parsedUrl.username,
  password: parsedUrl.password,
  database: parsedUrl.pathname.slice(1), // remove first slash
};

export default postgresConfig;
