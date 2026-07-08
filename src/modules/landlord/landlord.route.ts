import { Router } from "express";
import { landlordController } from "./landlord.controller";

const router = Router();
router.post("/", landlordController.creteLandlord);
router.get("/requests", landlordController.getLandlordProperties);
export const landlordRouter = router;
