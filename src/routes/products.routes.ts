import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { asyncHandler } from "../middlewares/error.middleware";

const productsRouter = Router();

productsRouter.get("/featured", asyncHandler((req, res) => productController.listFeatured(req, res)));
productsRouter.get("/", asyncHandler((req, res) => productController.listPublic(req, res)));
productsRouter.get("/:slug", asyncHandler((req, res) => productController.getBySlug(req, res)));

export default productsRouter;
