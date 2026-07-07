import { Router } from "express";
import { LandlordController } from "./landlord.controller";

const router = Router();
router.post("/", LandlordController.creteLandlord);
export const landlordRouter = router;
