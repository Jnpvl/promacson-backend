import { Router } from "express";
import { wholesaleController } from "../controllers/wholesale.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { requireAuth } from "../middlewares/auth.middleware";

const adminWholesaleRouter = Router();

adminWholesaleRouter.use(requireAuth);

adminWholesaleRouter.get("/", asyncHandler((req, res) => wholesaleController.listAdmin(req, res)));
adminWholesaleRouter.get("/:id", asyncHandler((req, res) => wholesaleController.getAdmin(req, res)));
adminWholesaleRouter.patch(
  "/:id/status",
  asyncHandler((req, res) => wholesaleController.updateStatus(req, res)),
);

export default adminWholesaleRouter;
