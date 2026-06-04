import { Router } from "express";
import { quoteController } from "../controllers/quote.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { requireAuth } from "../middlewares/auth.middleware";

const adminQuotesRouter = Router();

adminQuotesRouter.use(requireAuth);

adminQuotesRouter.get("/", asyncHandler((req, res) => quoteController.listAdmin(req, res)));
adminQuotesRouter.get("/:id", asyncHandler((req, res) => quoteController.getAdmin(req, res)));
adminQuotesRouter.patch("/:id/status", asyncHandler((req, res) => quoteController.updateStatus(req, res)));

export default adminQuotesRouter;
