import Branch from "../../../model/branches.model.js";

const findAll = () => Branch.find().sort({ createdAt: -1 });

const findById = (id) => Branch.findById(id);

const create = (data) => Branch.create(data);

const updateById = (id, data) =>
  Branch.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
  });

const deleteById = (id) => Branch.findByIdAndDelete(id);

export { create, deleteById, findAll, findById, updateById };
