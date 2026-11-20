import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import { customerUpload } from "../../../middlewares/upload.middleware.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../../customer/customer.validation.js";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../../customer/customer.controller.js";

const router = express.Router();

const agentOnly = (req, res, next) => {
  if (req.user?.accountModel !== "Agent") {
    return res.status(403).json({
      success: false,
      message: "Agent access required",
    });
  }

  next();
};

const customerFiles = customerUpload.fields([
  { name: "photo", maxCount: 1 },
  { name: "aadharDocument", maxCount: 1 },
  { name: "panDocument", maxCount: 1 },
]);

const hasUploads = (req) => {
  return Object.values(req.files || {}).some((files) => files.length > 0);
};

const validateUpdate = (req, res, next) => {
  if (hasUploads(req) && Object.keys(req.body).length === 0) {
    return next();
  }

  return validateMiddleware(updateCustomerSchema)(req, res, next);
};

router.use(authMiddleware, agentOnly);

/**
 * @swagger
 * /agent/customers:
 *   get:
 *     summary: List customers
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Customer list
 *   post:
 *     summary: Create a customer
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, phone, address]
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               joiningDate:
 *                 type: string
 *                 format: date-time
 *               fathersName:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *               pinCode:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *               aadhar:
 *                 type: string
 *               pan:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *               aadharDocument:
 *                 type: string
 *                 format: binary
 *               panDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Customer created
 */
router.get("/customers", getCustomers);
/**
 * @swagger
 * /agent/customers/{id}:
 *   get:
 *     summary: Get a customer
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer
 *       404:
 *         description: Customer not found
 *   patch:
 *     summary: Update a customer
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               joiningDate:
 *                 type: string
 *                 format: date-time
 *               fathersName:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *               pinCode:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *               aadhar:
 *                 type: string
 *               pan:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *               aadharDocument:
 *                 type: string
 *                 format: binary
 *               panDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Customer updated
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted
 */
router.get("/customers/:id", getCustomerById);
router.post(
  "/customers",
  customerFiles,
  validateMiddleware(createCustomerSchema),
  createCustomer
);
router.patch(
  "/customers/:id",
  customerFiles,
  validateUpdate,
  updateCustomer
);
router.delete("/customers/:id", deleteCustomer);

export default router;
