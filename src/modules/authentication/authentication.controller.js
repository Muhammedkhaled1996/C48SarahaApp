import { Router } from "express";
import { successResponce } from "./../../common/utils/success.responce.js";
import {
  signup,
  login,
  privilege,
  rotateToken,
  siginUpWithGmail,
  logout,
  confirmEmail,
  resendEmail,
  requestForgetPasswordCode,
  verifyForgotPasswordCode,
  resetPasswordCode,
} from "./authentication.services.js";
import { TokenEnum } from "../../common/enum/TokenEnum.js";
import { authentication, authorization } from "./../../middleware/authentication.middleware.js";
import { userRole } from "../../common/enum/userRole.enum.js";
import * as validators from "./authentication.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { del } from "../../common/services/index.js";
import { generateLimiter } from "./../../common/utils/index.js";

const router = Router({ caseSensitive: true, strict: true });

// signup with system
router.post("/signup", validation(validators.signup), async (req, res, next) => {
  const data = await signup(req.validate, `${req.protocol}://${req.host}`);
  return successResponce({ res, data, status: 201 });
});

// confirm email
router.patch("/confirm-email", validation(validators.confirmEmail), async (req, res, next) => {
  const data = await confirmEmail(req.validate);
  return successResponce({ res, data });
});

// resend otp email
router.patch("/resend-otp", validation(validators.resendOtp), async (req, res, next) => {
  const data = await resendEmail(req.validate);
  return successResponce({ res, data });
});

// login with system

const loginLimiter = generateLimiter({ limit: 5, ttl: 5, skipSuccessfulRequests: true });

router.post("/login", loginLimiter, validation(validators.login), async (req, res, next) => {
  const data = await login(req.validate, `${req.protocol}://${req.host}`);

  await del({ key: req?.rateLimit?.key });
  return successResponce({ res, data });
});

// Create privileges for users
router.post("/privilege", authentication(), authorization(userRole.admin), async (req, res, next) => {
  const data = await privilege(req.body);
  return successResponce({ res, data });
});

// rotate-token
router.post("/rotate-token", authentication(TokenEnum.Refresh), async (req, res, next) => {
  const data = await rotateToken(req.payload, req.user);
  return successResponce({ res, data });
});

// sigin with gmail
router.post("/sigup-with-gmail", async (req, res, next) => {
  const { status, data } = await siginUpWithGmail(req.body, `${req.protocol}://${req.host}`);
  return successResponce({ res, data, status });
});

// logout
router.post("/logout", validation(validators.logoutSchema), authentication(), async (req, res, next) => {
  const data = await logout(req.payload, req.user, req.validate);
  return successResponce({ res, data });
});

// forget password
router.post("/requset-forgot-password-code", validation(validators.resendOtp), async (req, res, next) => {
  const data = await requestForgetPasswordCode(req.validate);
  return successResponce({ res, data, status: 201 });
});

// verify forgot password
router.patch("/verify-forgot-password", validation(validators.confirmEmail), async (req, res, next) => {
  const data = await verifyForgotPasswordCode(req.validate);
  return successResponce({ res, data });
});

// reset password
router.patch("/reset-password", validation(validators.resetPassword), async (req, res, next) => {
  const data = await resetPasswordCode(req.validate);
  return successResponce({ res, data });
});

export default router;
