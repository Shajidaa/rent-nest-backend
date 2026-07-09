import { Router } from "express";
import { landlordController } from "./landlord.controller";

const router = Router();
router.post("/", landlordController.creteLandlord);
router.get("/requests", landlordController.getLandlordProperties);
router.put("/:id", landlordController.updateLandlord);
router.delete("/:id", landlordController.deleteLandlord);
router.patch("/:id", landlordController.updateLandlordStatus);
export const landlordRouter = router;
