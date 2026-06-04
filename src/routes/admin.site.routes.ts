import { Router } from "express";
import { adminSiteController } from "../controllers/admin.site.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { requireAuth } from "../middlewares/auth.middleware";

const adminSiteRouter = Router();

adminSiteRouter.use(requireAuth);

adminSiteRouter.get("/contact", asyncHandler((req, res) => adminSiteController.getContact(req, res)));
adminSiteRouter.put("/contact", asyncHandler((req, res) => adminSiteController.updateContact(req, res)));

export default adminSiteRouter;
