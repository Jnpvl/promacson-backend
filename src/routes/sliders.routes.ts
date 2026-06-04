import { Router } from "express";
import { sliderController } from "../controllers/slider.controller";
import { asyncHandler } from "../middlewares/error.middleware";

const slidersRouter = Router();

slidersRouter.get("/", asyncHandler((req, res) => sliderController.listPublic(req, res)));

export default slidersRouter;
