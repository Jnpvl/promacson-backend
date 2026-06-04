import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { categoryImageUpload } from "../middlewares/category-upload.middleware";

const adminCategoriesRouter = Router();

adminCategoriesRouter.use(requireAuth);

adminCategoriesRouter.post("/upload/image", (req, res) => {
  categoryImageUpload(req, res, (err) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Error al subir imagen";
      return res.status(400).json({ error: message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }
    return res.status(201).json({ url: `/uploads/categories/${req.file.filename}` });
  });
});

adminCategoriesRouter.get("/", asyncHandler((req, res) => categoryController.listAdmin(req, res)));
adminCategoriesRouter.patch("/:id/move", asyncHandler((req, res) => categoryController.move(req, res)));
adminCategoriesRouter.get("/:id", asyncHandler((req, res) => categoryController.getAdmin(req, res)));
adminCategoriesRouter.post("/", asyncHandler((req, res) => categoryController.create(req, res)));
adminCategoriesRouter.put("/:id", asyncHandler((req, res) => categoryController.update(req, res)));
adminCategoriesRouter.delete("/:id", asyncHandler((req, res) => categoryController.remove(req, res)));

export default adminCategoriesRouter;
