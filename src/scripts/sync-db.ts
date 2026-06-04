import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { buildDataSourceOptions } from "../config/database";

dotenv.config();

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
