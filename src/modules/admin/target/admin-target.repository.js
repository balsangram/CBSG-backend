import Target from "../../../model/target.model.js";

const SORTABLE_FIELDS = ["name", "levelNo", "amount", "customer", "createdAt"];

const findAll = async ({ page = 1, limit = 10, search, role, status, sort } = {}) => {
  const filter = {};

  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { levelNo: rx }, { prize: rx }];
  }

  if (role) filter.role = role;
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  const [targets, total] = await Promise.all([
    Target.find(filter).sort(sort || { createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Target.countDocuments(filter),
  ]);

  return { targets, total };
};

const create = (data) => Target.create(data);

const updateById = (id, data) => {
  return Target.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteById = (id) => Target.findByIdAndDelete(id);

export { findAll, create, updateById, deleteById };
