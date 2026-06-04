import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/login", (req, res) => {
  authController.login(req, res);
});

authRouter.get("/me", requireAuth, (req, res) => {
  authController.me(req, res);
});

export default authRouter;
