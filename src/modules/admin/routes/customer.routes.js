import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import adminOnly from "../../../middlewares/admin.middleware.js";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import { customerUpload, imageUpload } from "../../../middlewares/upload.middleware.js";
import {
  createAdminCustomerSchema,
  updateAdminCustomerSchema,
} from "../customer/validation/admin-customer.validation.js";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../customer/controller/admin-customer.controller.js";

const router = express.Router();

const customerFiles = customerUpload.fields([
  { name: "photo", maxCount: 1 },
  { name: "aadharDocument", maxCount: 1 },
  { name: "panDocument", maxCount: 1 },
]);

const validateUpdate = (req, res, next) => {
  const hasUpload = ["photo", "aadharDocument", "panDocument"].some(
    (field) => req.files?.[field]?.length
  );

  if (hasUpload && Object.keys(req.body).length === 0) {
    return next();
  }

  return validateMiddleware(updateAdminCustomerSchema)(req, res, next);
};

router.use(authMiddleware, adminOnly);

router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.post("/", imageUpload.single("photo"), validateMiddleware(createAdminCustomerSchema), createCustomer);
router.put("/:id", customerFiles, validateUpdate, updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
