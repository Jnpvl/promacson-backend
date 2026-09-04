import "reflect-metadata";
import { DataSource } from "typeorm";
import { loadEnv } from "../config/env";
import { buildDataSourceOptions } from "../config/database";

loadEnv();

async function syncDb() {
  const syncSource = new DataSource(buildDataSourceOptions(true));
  await syncSource.initialize();
  console.log("[db:sync] Schema synchronized");
  await syncSource.destroy();
}

syncDb().catch((err) => {
  console.error(err);
  process.exit(1);
});
