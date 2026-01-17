import { Router } from "express";
import { registerUser, verifyEmail, resendVerificationToken, login, logout, refreshAccessToken } from "../controllers/auth.controllers.js";
import validate from "../middlewares/validator.middleware.js";
import { registerValidator, resendVerificationTokenValidator, userLoginValidator } from "../validators/index.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerValidator(), validate, registerUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/resend-email-verification").post(resendVerificationTokenValidator(), validate, resendVerificationToken)
router.route("/login").post(userLoginValidator(),validate,login);
router.route("/logout").post(verifyJWT,validate,logout);
router.route("/refresh-token").post(refreshAccessToken);

export default router;