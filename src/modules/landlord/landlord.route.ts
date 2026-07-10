import { Router } from "express";
import { landlordController } from "./landlord.controller";

const router = Router();
router.post("/", landlordController.creteLandlord);
router.get("/requests", landlordController.getLandlordProperties);
router.put("/:id", landlordController.updateLandlord);
router.delete("/:id", landlordController.deleteLandlord);
router.patch("/requests/:id", landlordController.updateLandlordStatus);
router.get("/requests/:id", landlordController.getPropertyRequest);
export const landlordRouter = router;
