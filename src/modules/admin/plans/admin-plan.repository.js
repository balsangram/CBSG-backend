import Plan from "../../../model/plans.model.js";

const findAll = () => Plan.find().sort({ createdAt: -1 });

const findById = (id) => Plan.findById(id);

const create = (data) => Plan.create(data);

const updateById = (id, data) => {
  return Plan.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export { findAll, findById, create, updateById };
