import { Router } from "express";
import { reviewController } from "./review.controller";

const router = Router();
router.post("/", reviewController.createdReview);
export const reviewRouter = router;
