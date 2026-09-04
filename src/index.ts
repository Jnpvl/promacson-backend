import "reflect-metadata";
import { loadEnv, logMailStatus } from "./config/env";
import Server from "./models/server";
import { initializeDatabases } from "./config/database";

loadEnv();

async function main() {
  try {
    await initializeDatabases();
    console.log("Base de datos inicializada correctamente.");
  } catch (error) {
    console.error("Error conectando a la base de datos:", error);
    process.exit(1);
  }

  logMailStatus();
  const server = new Server();
  server.start();
}

main();
