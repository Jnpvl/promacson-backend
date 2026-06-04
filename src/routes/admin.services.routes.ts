import { Router } from "express";
import { serviceController } from "../controllers/service.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { serviceImageUpload } from "../middlewares/service-upload.middleware";

const adminServicesRouter = Router();

adminServicesRouter.use(requireAuth);

adminServicesRouter.post("/upload/image", (req, res) => {
  serviceImageUpload(req, res, (err) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Error al subir imagen";
      return res.status(400).json({ error: message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }
    return res.status(201).json({ url: `/uploads/services/${req.file.filename}` });
  });
});

adminServicesRouter.get("/", asyncHandler((req, res) => serviceController.listAdmin(req, res)));
adminServicesRouter.patch("/:id/move", asyncHandler((req, res) => serviceController.move(req, res)));
adminServicesRouter.get("/:id", asyncHandler((req, res) => serviceController.getAdmin(req, res)));
adminServicesRouter.post("/", asyncHandler((req, res) => serviceController.create(req, res)));
adminServicesRouter.put("/:id", asyncHandler((req, res) => serviceController.update(req, res)));
adminServicesRouter.delete("/:id", asyncHandler((req, res) => serviceController.remove(req, res)));

export default adminServicesRouter;
