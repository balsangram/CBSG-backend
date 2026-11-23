export const customerRoutes = Router();

router.get("/dashboard", dashboard);
router.get("/pay-amount", payAmount);
router.get("/saving-plans", savingPlans);
router.get("/transactions", transactions);
router.get("/notifications", notifications);

customerRoutes.use("/kyc", customerKycRoutes);
customerRoutes.use("/profile", customerProfileRoutes);
customerRoutes.use("/bank", customerBankRoutes);