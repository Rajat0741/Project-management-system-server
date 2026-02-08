import { Router } from "express";
import { registerUser, verifyEmail, resendVerificationToken, login, logout, refreshAccessToken, changeCurrentPassword, forgotPasswordRequest, resetForgotPassword, getCurrentUser, changeAvatar } from "../controllers/auth.controllers.js";
import validate from "../middlewares/validator.middleware.js";
import { registerValidator, resendVerificationTokenValidator, userLoginValidator, forgotPasswordValidator, userChangeCurrentPasswordValidator, userChangeForgotPasswordValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";

const router = Router();

//public routes
router.route("/register").post(registerValidator(), validate, registerUser);
router.route("/resend-email-verification").post(resendVerificationTokenValidator(), validate, resendVerificationToken)
router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/login").post(userLoginValidator(), validate, login);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(forgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userChangeForgotPasswordValidator(), validate, resetForgotPassword);

//secure route
router.route("/logout").post(verifyJWT, logout);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/avatar").patch(verifyJWT, uploadAvatar.single("avatar"), changeAvatar);

export default router;