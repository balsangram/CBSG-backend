import express from "express";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import {
    adminLoginSchema,
    adminVerifyOtpSchema,
    agentSendOtpSchema,
    agentVerifyOtpSchema,
    customerSendOtpSchema,
    customerVerifyOtpSchema,
} from "./auth.validation.js";
import {
    adminLogin,
    adminVerifyOtp,
    agentSendOtp,
    agentVerifyOtp,
    customerSendOtp,
    customerVerifyOtp,
} from "./auth.controller.js";

const router = express.Router();

router.post(
    "/customer/send-otp",
    validateMiddleware(customerSendOtpSchema),
    customerSendOtp
);
router.post(
    "/customer/verify-otp",
    validateMiddleware(customerVerifyOtpSchema),
    customerVerifyOtp
);

router.post(
    "/agent/send-otp",
    validateMiddleware(agentSendOtpSchema),
    agentSendOtp
);
router.post(
    "/agent/verify-otp",
    validateMiddleware(agentVerifyOtpSchema),
    agentVerifyOtp
);

router.post("/admin/login", validateMiddleware(adminLoginSchema), adminLogin);
router.post(
    "/admin/verify-otp",
    validateMiddleware(adminVerifyOtpSchema),
    adminVerifyOtp
);

export default router;
