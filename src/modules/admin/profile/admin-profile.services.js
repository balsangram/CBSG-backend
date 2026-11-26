import mongoose from "mongoose";
import { deleteFromS3, uploadToS3 } from "../../../utils/s3.js";
import { toAdminProfileDto } from "./admin-profile.dto.js";
import {
  findProfileById,
  updateProfileById,
} from "./admin-profile.repository.js";

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertAdminId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(401, "Invalid admin session");
  }
};

const handleDuplicate = (error) => {
  if (error?.code !== 11000) throw error;

  const field = Object.keys(error.keyPattern || {})[0];
  const label = field === "phone" ? "Phone number" : "Email";
  throw httpError(409, `${label} already exists`);
};

const getAdminOrThrow = async (adminId) => {
  assertAdminId(adminId);
  const admin = await findProfileById(adminId);

  if (!admin) {
    throw httpError(404, "Admin not found");
  }

  return admin;
};

const getAdminProfile = async (adminId) => {
  const admin = await getAdminOrThrow(adminId);
  return toAdminProfileDto(admin);
};

const updateAdminProfile = async (adminId, data, file) => {
  const admin = await getAdminOrThrow(adminId);
  const photo = file ? await uploadToS3(file, "admins") : undefined;

  if (photo) data.photo = photo;

  try {
    const updated = await updateProfileById(adminId, data);

    if (photo && admin.photo) {
      await deleteFromS3(admin.photo);
    }

    return toAdminProfileDto(updated);
  } catch (error) {
    if (photo) {
      await deleteFromS3(photo);
    }
    handleDuplicate(error);
  }
};

export { getAdminProfile, updateAdminProfile };
