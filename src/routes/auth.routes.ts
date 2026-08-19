import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/login", (req, res) => {
  authController.login(req, res);
});

authRouter.get("/me", requireAuth, (req, res) => {
  authController.me(req, res);
});

authRouter.post("/users", optionalAuth, asyncHandler((req, res) => authController.create(req, res)));

export default authRouter;
