import { Router } from "express";
import { registerUser, verifyEmail, resendVerificationToken } from "../controllers/auth.controllers.js";
import validate from "../middlewares/validator.middleware.js";
import { registerValidator, resendVerificationTokenValidator } from "../validators/index.js";

const router = Router();

router.route("/register").put(registerValidator(), validate, registerUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/resend-email-verification").put(resendVerificationTokenValidator(), validate, resendVerificationToken)

export default router;