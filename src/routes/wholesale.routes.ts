import { Router } from "express";
import { wholesaleController } from "../controllers/wholesale.controller";
import { asyncHandler } from "../middlewares/error.middleware";

const wholesaleRouter = Router();

wholesaleRouter.post("/", asyncHandler((req, res) => wholesaleController.submit(req, res)));

export default wholesaleRouter;
