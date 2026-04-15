import { Router } from "express";
import { registerUser, verifyEmail, resendVerificationToken, login, logout, refreshAccessToken, changeCurrentPassword, forgotPasswordRequest, resetForgotPassword, getCurrentUser, changeAvatar } from "../controllers/auth.controllers.js";
import validate from "../middlewares/validator.middleware.js";
import { registerSchema, verifyEmailSchema, resendVerificationTokenSchema, userLoginSchema, forgotPasswordSchema, userChangeCurrentPasswordSchema, userChangeForgotPasswordSchema } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";

const router = Router();

//public routes
router.route("/register").post(validate(registerSchema), registerUser);
router.route("/resend-email-verification").post(validate(resendVerificationTokenSchema), resendVerificationToken)
router.route("/verify-email/:verificationToken").get(validate(verifyEmailSchema), verifyEmail);

router.route("/login").post(validate(userLoginSchema), login);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(validate(forgotPasswordSchema), forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(validate(userChangeForgotPasswordSchema), resetForgotPassword);

//secure route
router.route("/logout").post(verifyJWT, logout);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, validate(userChangeCurrentPasswordSchema), changeCurrentPassword);
router.route("/avatar").patch(verifyJWT, uploadAvatar.single("avatar"), changeAvatar);

export default router;