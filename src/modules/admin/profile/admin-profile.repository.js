import Admin from "../../../model/admin.model.js";

const PROFILE_SELECT =
  "name email photo phone role services status createdAt updatedAt";

const findProfileById = (id) => Admin.findById(id).select(PROFILE_SELECT);

const updateProfileById = (id, data) => {
  return Admin.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).select(PROFILE_SELECT);
};

export { findProfileById, updateProfileById };
