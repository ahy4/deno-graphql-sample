type EnvironmentType = {
  postgres: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
};
export default EnvironmentType;
