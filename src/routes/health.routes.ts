import { Router } from "express";
import { healthController } from "../controllers/health.controller";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  healthController.check(_req, res);
});

export default healthRouter;
