import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { validateRentalAccess } from "../../middleware/paid";

const router = Router();
router.post(
  "/",
  auth(Role.TENANT),
  validateRentalAccess,
  reviewController.createdReview,
);
// router.get("/", reviewController.createdReview);
// router.get("/:id", reviewController.getReviewById);
router.get("/property/:propertyId", reviewController.getReviewsByProperty);
export const reviewRouter = router;
