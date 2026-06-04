import { Router } from "express";
import { searchController } from "../controllers/search.controller";
import { asyncHandler } from "../middlewares/error.middleware";

const searchRouter = Router();

searchRouter.get("/", asyncHandler((req, res) => searchController.search(req, res)));

export default searchRouter;
