import dotenv from "dotenv";
import { DataSource, type DataSourceOptions } from "typeorm";
import { ENTITIES } from "../entities";

dotenv.config();

function useSsl(): boolean | { rejectUnauthorized: boolean } {
  if (process.env.DB_SSL === "true") {
    return { rejectUnauthorized: false };
  }
  return false;
}

/** Si hay host o password sueltos, evita armar la URI a mano (caracteres especiales en la clave). */
function hasDiscreteDbConfig(): boolean {
  return Boolean(process.env.DB_HOST?.trim() || process.env.DB_PASSWORD !== undefined);
}

export function buildDataSourceOptions(forceSynchronize?: boolean): DataSourceOptions {
  const synchronize =
    forceSynchronize ??
    (process.env.DB_SYNC === "true" || process.env.NODE_ENV !== "production");

  const common = {
    type: "postgres" as const,
    synchronize,
    logging: process.env.NODE_ENV === "development",
    entities: ENTITIES,
    ssl: useSsl(),
  };

  if (hasDiscreteDbConfig()) {
    return {
      ...common,
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "promacson",
    };
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    return {
      ...common,
      url: databaseUrl,
    };
  }

  return {
    ...common,
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "",
    database: "promacson",
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
