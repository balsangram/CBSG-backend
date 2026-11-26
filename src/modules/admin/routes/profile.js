import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import adminOnly from "../../../middlewares/admin.middleware.js";
import validateMiddleware from "../../../middlewares/validate.middleware.js";
import { imageUpload } from "../../../middlewares/upload.middleware.js";
import { updateAdminProfileSchema } from "../profile/admin-profile.validation.js";
import {
  getAdminProfile,
  updateAdminProfile,
} from "../profile/admin-profile.controller.js";

const router = express.Router();

const validateUpdate = (req, res, next) => {
  if (req.file && Object.keys(req.body).length === 0) {
    return next();
  }

  return validateMiddleware(updateAdminProfileSchema)(req, res, next);
};

router.use(authMiddleware, adminOnly);

/**
 * @swagger
 * /admin/profile:
 *   get:
 *     summary: Get the logged-in admin profile
 *     tags: [Admin Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile
 *       401:
 *         description: Authentication token is missing or expired
 *       404:
 *         description: Admin not found
 *   put:
 *     summary: Update the logged-in admin profile
 *     tags: [Admin Profile]
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
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication token is missing or expired
 *       404:
 *         description: Admin not found
 *       409:
 *         description: Email or phone number already exists
 */
router.get("/", getAdminProfile);
router.put("/", imageUpload.single("photo"), validateUpdate, updateAdminProfile);

export default router;
