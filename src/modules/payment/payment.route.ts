import { Router } from "express";
import { paymentController } from "./payment.controller";

import { isRentalApproved } from "../../middleware/approved";
const router = Router();
router.post(
  "/create",
  isRentalApproved,
  paymentController.createCheckoutSession,
);

router.post("/confirm", paymentController.handleWebhook);
router.get("/", paymentController.getUserPayments);
router.get("/:id", paymentController.getPaymentDetails);

export const paymentRouter = router;
