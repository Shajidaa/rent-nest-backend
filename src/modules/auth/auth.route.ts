import { Router } from "express";
import { authController } from "./auth.controller";

const route = Router();

route.post("/login", authController.login);
route.post("/refresh-token", authController.refreshToken);
route.post("/google", authController.googleLogin);
export const authRouter = route;
