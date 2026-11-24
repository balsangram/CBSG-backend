import express from "express";
import { customerUpload } from "../../../middlewares/upload.middleware.js";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import { afterLoginSchema } from "../profile/customer-profile.validation.js";
import {
  afterLogin,
  deleteProfile,
  getProfile,
} from "../profile/customer-profile.controller.js";

const router = express.Router();

const documents = customerUpload.fields([
  { name: "photo", maxCount: 1 },
  { name: "aadharDocument", maxCount: 1 },
  { name: "panDocument", maxCount: 1 },
]);

const hasUploads = (req) => {
  return Object.values(req.files || {}).some((files) => files.length > 0);
};

const validateAfterLogin = (req, res, next) => {
  const schema = hasUploads(req)
    ? afterLoginSchema
    : afterLoginSchema.min(1).messages({
        "object.min": "At least one field is required",
      });

  return validateMiddleware(schema)(req, res, next);
};

/**
 * @swagger
 * /customer/profile:
 *   get:
 *     summary: Get the logged-in customer's profile
 *     description: Returns the profile fields and how many of them have a value.
 *     tags: [Customer Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile and filled field count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerProfileResponse'
 *             example:
 *               success: true
 *               message: Profile fetched successfully
 *               data:
 *                 id: 6740c2a1b8e4f1a2c3d4e5f6
 *                 name: Asha Patel
 *                 email: asha@example.com
 *                 photo: null
 *                 phone: "9876543210"
 *                 joiningDate: 2026-01-15T00:00:00.000Z
 *                 fathersName: Ramesh Patel
 *                 dob: 1995-04-12T00:00:00.000Z
 *                 address: 12 Market Road
 *                 pinCode: "380001"
 *                 aadhar: "234567890123"
 *                 aadharDocument: null
 *                 pan: ABCDE1234F
 *                 panDocument: null
 *                 nominee: null
 *                 nomineeRelation: null
 *                 bankName: null
 *                 accountNumber: null
 *                 ifscCode: null
 *                 filledFields: 10
 *                 totalFields: 18
 *       401:
 *         description: Authentication token is missing or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     summary: Update the logged-in customer's profile
 *     description: Every profile field can be sent. Only the customer in the access token is updated. Photo, Aadhaar document, and PAN document are file uploads. A KYC record is created when all 18 fields are filled.
 *     tags: [Customer Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
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
 *               aadharDocument:
 *                 type: string
 *                 format: binary
 *               pan:
 *                 type: string
 *               panDocument:
 *                 type: string
 *                 format: binary
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
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerProfileResponse'
 *             example:
 *               success: true
 *               message: Profile updated successfully
 *               data:
 *                 id: 6740c2a1b8e4f1a2c3d4e5f6
 *                 name: Asha Patel
 *                 email: asha@example.com
 *                 photo: https://example.com/customers/photo.jpg
 *                 phone: "9876543210"
 *                 joiningDate: 2026-01-15T00:00:00.000Z
 *                 fathersName: Ramesh Patel
 *                 dob: 1995-04-12T00:00:00.000Z
 *                 address: 12 Market Road
 *                 pinCode: "380001"
 *                 aadhar: "234567890123"
 *                 aadharDocument: https://example.com/customers/aadhar/aadhaar.pdf
 *                 pan: ABCDE1234F
 *                 panDocument: https://example.com/customers/pan/pan.pdf
 *                 nominee: Ramesh Patel
 *                 nomineeRelation: Father
 *                 bankName: State Bank of India
 *                 accountNumber: "123456789012"
 *                 ifscCode: SBIN0001234
 *                 filledFields: 18
 *                 totalFields: 18
 *       401:
 *         description: Authentication token is missing or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Phone number already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete the logged-in customer's account
 *     description: Deletes the customer from the access token, including KYC, interest, login OTPs, and uploaded photo, Aadhaar, and PAN files.
 *     tags: [Customer Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Account deleted successfully
 *                 data:
 *                   id: 6740c2a1b8e4f1a2c3d4e5f6
 *       401:
 *         description: Authentication token is missing or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", getProfile);
router.delete("/", deleteProfile);
router.patch("/", documents, validateAfterLogin, afterLogin);

export default router;
