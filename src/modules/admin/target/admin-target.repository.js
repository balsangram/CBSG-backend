import Target from "../../../model/target.model.js";

const findAll = () => Target.find().sort({ createdAt: -1 });

const create = (data) => Target.create(data);

const updateById = (id, data) => {
  return Target.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteById = (id) => Target.findByIdAndDelete(id);

export { findAll, create, updateById, deleteById };
