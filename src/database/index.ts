import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async (host = "database"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  let testOptions = {};

  if (process.env.NODE_ENV === "test") {
    testOptions = {
      host: "localhost",
      database: "fin_api_test",
    };
  }

  const connOptions = Object.assign(defaultOptions, { host }, testOptions);

  return createConnection(connOptions);
};



