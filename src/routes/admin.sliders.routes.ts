import { Router } from "express";
import { sliderController } from "../controllers/slider.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { sliderImageUpload } from "../middlewares/image-upload.middleware";
import { respondWithUploadedImage } from "../utils/upload-response";

const adminSlidersRouter = Router();

adminSlidersRouter.use(requireAuth);

adminSlidersRouter.post("/upload/image", (req, res) => {
  sliderImageUpload(req, res, async (err) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Error al subir imagen";
      return res.status(400).json({ error: message });
    }
    return respondWithUploadedImage(res, "sliders", req.file);
  });
});

adminSlidersRouter.get("/", asyncHandler((req, res) => sliderController.listAdmin(req, res)));
adminSlidersRouter.patch("/:id/move", asyncHandler((req, res) => sliderController.move(req, res)));
adminSlidersRouter.get("/:id", asyncHandler((req, res) => sliderController.getAdmin(req, res)));
adminSlidersRouter.post("/", asyncHandler((req, res) => sliderController.create(req, res)));
adminSlidersRouter.put("/:id", asyncHandler((req, res) => sliderController.update(req, res)));
adminSlidersRouter.delete("/:id", asyncHandler((req, res) => sliderController.remove(req, res)));

export default adminSlidersRouter;
