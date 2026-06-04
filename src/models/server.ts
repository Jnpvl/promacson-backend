import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import v1Router from "../routes";
import { errorHandler } from "../middlewares/error.middleware";

class Server {
  public app: Application;
  public PORT = parseInt(process.env.PORT || "4000", 10);

  constructor() {
    this.app = express();
    this.config();
    this.router();
  }

  config(): void {
    this.app.use(morgan("dev"));

    const corsOrigin = process.env.CORS_ORIGIN?.trim();
    this.app.use(
      cors({
        origin: corsOrigin && corsOrigin.length > 0 ? corsOrigin.split(",").map((o) => o.trim()) : "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: Boolean(corsOrigin),
      }),
    );

    this.app.use(express.json());
    this.app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
  }

  router(): void {
    this.app.use("/api/v1", v1Router);

    this.app.use((_req, res) => {
      res.status(404).json({ error: "Ruta no encontrada" });
    });

    this.app.use(errorHandler);
  }

  start(): void {
    this.app.get("/", (_req, res) => {
      res.json({ status: "OK" });
    });

    this.app.listen(this.PORT, () => {
      console.log(`Server running at http://localhost:${this.PORT}`);
    });
  }
}

export default Server;
