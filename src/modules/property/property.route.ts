import { Router } from "express";
import { PropertyController } from "./property.controller";

const router = Router();
router.get("/", PropertyController.getAllProperties);
router.get("/:id", PropertyController.getPropertyById);
export const propertyRouter = router;
