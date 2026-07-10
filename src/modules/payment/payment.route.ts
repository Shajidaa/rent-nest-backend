import { Router } from "express";

const router = Router();
router.post("/create");
router.get("/confirm");
router.get("/:id");
export const paymentRouter = router;
