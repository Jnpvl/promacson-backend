import { Router } from "express";
import { serviceController } from "../controllers/service.controller";
import { asyncHandler } from "../middlewares/error.middleware";

const servicesRouter = Router();

servicesRouter.get("/", asyncHandler((req, res) => serviceController.listPublic(req, res)));
servicesRouter.get("/:slug", asyncHandler((req, res) => serviceController.getBySlug(req, res)));

export default servicesRouter;
