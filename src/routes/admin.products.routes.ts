import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { productImagesUpload } from "../middlewares/product-upload.middleware";

const adminProductsRouter = Router();

adminProductsRouter.use(requireAuth);

adminProductsRouter.post("/upload/images", (req, res) => {
  productImagesUpload(req, res, (err) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Error al subir imágenes";
      return res.status(400).json({ error: message });
    }
    if (!req.files?.length) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }
    const urls = (req.files as Express.Multer.File[]).map(
      (file) => `/uploads/products/${file.filename}`,
    );
    return res.status(201).json({ urls });
  });
});

adminProductsRouter.get("/", asyncHandler((req, res) => productController.listAdmin(req, res)));
adminProductsRouter.get("/:id", asyncHandler((req, res) => productController.getAdmin(req, res)));
adminProductsRouter.post("/", asyncHandler((req, res) => productController.create(req, res)));
adminProductsRouter.put("/:id", asyncHandler((req, res) => productController.update(req, res)));
adminProductsRouter.delete("/:id", asyncHandler((req, res) => productController.remove(req, res)));

export default adminProductsRouter;
