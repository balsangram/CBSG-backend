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
 *     description: Returns customers newest first. page defaults to 1 and limit defaults to 10, with a maximum of 50.
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Customer page
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Customers fetched successfully
 *                 data:
 *                   customers:
 *                     - id: 6741a0c2e1b2c3d4e5f60710
 *                       name: Asha Patel
 *                       email: asha@example.com
 *                       phone: "9876543210"
 *                       photo: null
 *                       agentId: 6741a0c2e1b2c3d4e5f60711
 *                       joiningDate: 2026-01-15T00:00:00.000Z
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     total: 24
 *                     totalPages: 3
 *   post:
 *     summary: Create a customer
 *     description: The agent id is taken from the access token and saved on the customer. It is not sent in the body.
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
 *               aadhar:
 *                 type: string
 *               pan:
 *                 type: string
 *               nominee:
 *                 type: string
 *               nomineeRelation:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
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
router.get("/", getCustomers);
/**
 * @swagger
 * /agent/customers/{id}:
 *   get:
 *     summary: Get a customer
 *     description: Includes totalDays from the joining date through today, and totalSaved from saving transactions only. Withdrawals are not included.
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
 *               aadhar:
 *                 type: string
 *               pan:
 *                 type: string
 *               nominee:
 *                 type: string
 *               nomineeRelation:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
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
router.get("/:id", getCustomerById);
router.post(
  "/",
  customerFiles,
  validateMiddleware(createCustomerSchema),
  createCustomer
);
router.patch(
  "/:id",
  customerFiles,
  validateUpdate,
  updateCustomer
);
router.delete("/:id", deleteCustomer);

export default router;
