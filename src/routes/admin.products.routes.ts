import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { productImagesUpload } from "../middlewares/image-upload.middleware";
import { respondWithUploadedImages } from "../utils/upload-response";

const adminProductsRouter = Router();

adminProductsRouter.use(requireAuth);

adminProductsRouter.post("/upload/images", (req, res) => {
  productImagesUpload(req, res, async (err) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Error al subir imágenes";
      return res.status(400).json({ error: message });
    }
    const files = req.files as Express.Multer.File[] | undefined;
    return respondWithUploadedImages(res, "products", files);
  });
});

adminProductsRouter.get("/", asyncHandler((req, res) => productController.listAdmin(req, res)));
adminProductsRouter.get("/:id", asyncHandler((req, res) => productController.getAdmin(req, res)));
adminProductsRouter.post("/", asyncHandler((req, res) => productController.create(req, res)));
adminProductsRouter.put("/:id", asyncHandler((req, res) => productController.update(req, res)));
adminProductsRouter.delete("/:id", asyncHandler((req, res) => productController.remove(req, res)));

export default adminProductsRouter;
