import { Router } from "express";
import { landlordController } from "./landlord.controller";

const router = Router();
router.post("/", landlordController.creteLandlord);
router.get("/", landlordController.allProperties);
// router.get("/:id", landlordController.singleProperties);
router.get("/requests", landlordController.getLandlordProperties);
router.patch("/:id", landlordController.updateLandlord);
router.delete("/:id", landlordController.deleteLandlord);
router.patch("/requests/:id", landlordController.updateLandlordStatus);
router.get("/requests/:id", landlordController.getPropertyRequest);
export const landlordRouter = router;
