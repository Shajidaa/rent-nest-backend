import { Router } from "express";
import { PropertyController } from "./property.controller";

const router = Router();
router.get("/", PropertyController.getAllProperties);
export const propertyRouter = router;
