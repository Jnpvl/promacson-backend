import dotenv from "dotenv";
import { DataSource, type DataSourceOptions } from "typeorm";
import { ENTITIES } from "../entities";

dotenv.config();

function useSsl(): boolean | { rejectUnauthorized: boolean } {
  if (process.env.DB_SSL === "false") return false;
  if (process.env.DB_SSL === "true" || process.env.DATABASE_URL) {
    return { rejectUnauthorized: false };
  }
  return false;
}

export function buildDataSourceOptions(forceSynchronize?: boolean): DataSourceOptions {
  const synchronize =
    forceSynchronize ??
    (process.env.DB_SYNC === "true" || process.env.NODE_ENV !== "production");

  const databaseUrl = process.env.DATABASE_URL?.trim();

  const common = {
    type: "postgres" as const,
    synchronize,
    logging: process.env.NODE_ENV === "development",
    entities: ENTITIES,
    ssl: useSsl(),
  };

  if (databaseUrl) {
    return {
      ...common,
      url: databaseUrl,
    };
  }

  return {
    ...common,
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "postgres",
  };
}

export const AppDataSource = new DataSource(buildDataSourceOptions());

export const initializeDatabases = async () => {
  try {
    await AppDataSource.initialize();
  } catch (error) {
    console.error("Error conectando a la base de datos:", error);
    throw error;
  }
};
