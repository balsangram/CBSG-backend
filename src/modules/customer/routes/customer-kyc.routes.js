router.get("/status", kycStatus);
router.patch("/:id", updateKyc);
export default customerKycRoutes;