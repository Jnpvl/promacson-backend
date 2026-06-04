import "reflect-metadata";
import dotenv from "dotenv";
import Server from "./models/server";
import { initializeDatabases } from "./config/database";
import { seedAdminUser } from "./scripts/seed";

dotenv.config();

async function main() {
  try {
    await initializeDatabases();
    console.log("Base de datos inicializada correctamente.");
    await seedAdminUser();
  } catch (error) {
    console.error("Error conectando a la base de datos:", error);
    process.exit(1);
  }

  const server = new Server();
  server.start();
}

main();
