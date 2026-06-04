import { Router } from "express";
import { siteController } from "../controllers/site.controller";
import { asyncHandler } from "../middlewares/error.middleware";

const siteRouter = Router();

siteRouter.get("/contact", asyncHandler((req, res) => siteController.contact(req, res)));

export default siteRouter;
