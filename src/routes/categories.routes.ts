import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { asyncHandler } from "../middlewares/error.middleware";

const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler((req, res) => categoryController.listPublic(req, res)));
categoriesRouter.get("/:slug", asyncHandler((req, res) => categoryController.getBySlug(req, res)));

export default categoriesRouter;
