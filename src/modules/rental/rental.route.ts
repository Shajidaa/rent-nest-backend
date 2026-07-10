import { Router } from "express";
import { rentalController } from "./rental.controller";

const router = Router();
router.post("/", rentalController.createRentalRequest);
router.get("/", rentalController.getMyRentals);
router.get("/:id", rentalController.getRentalDetails);
export const rentalRouter = router;
