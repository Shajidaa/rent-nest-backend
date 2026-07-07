import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/browser";

const router = Router();

router.post("/register", userController.createdUser);
router.get(
  "/profile",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  userController.getProfile,
);
router.put(
  "/profile",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  userController.updateProfile,
);
export const userRouter = router;
