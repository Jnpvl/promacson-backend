import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { categoryImageUpload } from "../middlewares/image-upload.middleware";
import { respondWithUploadedImage } from "../utils/upload-response";

const adminCategoriesRouter = Router();

adminCategoriesRouter.use(requireAuth);

adminCategoriesRouter.post("/upload/image", (req, res) => {
  categoryImageUpload(req, res, async (err) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Error al subir imagen";
      return res.status(400).json({ error: message });
    }
    return respondWithUploadedImage(res, "categories", req.file);
  });
});

adminCategoriesRouter.get("/", asyncHandler((req, res) => categoryController.listAdmin(req, res)));
adminCategoriesRouter.patch("/:id/move", asyncHandler((req, res) => categoryController.move(req, res)));
adminCategoriesRouter.get("/:id", asyncHandler((req, res) => categoryController.getAdmin(req, res)));
adminCategoriesRouter.post("/", asyncHandler((req, res) => categoryController.create(req, res)));
adminCategoriesRouter.put("/:id", asyncHandler((req, res) => categoryController.update(req, res)));
adminCategoriesRouter.delete("/:id", asyncHandler((req, res) => categoryController.remove(req, res)));

export default adminCategoriesRouter;
