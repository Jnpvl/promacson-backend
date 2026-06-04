import { Router } from "express";
import { quoteController } from "../controllers/quote.controller";
import { asyncHandler } from "../middlewares/error.middleware";

const quotesRouter = Router();

quotesRouter.post("/", asyncHandler((req, res) => quoteController.submit(req, res)));

export default quotesRouter;
