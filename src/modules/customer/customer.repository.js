import Customer from "../../model/customer.model.js";

const findPage = (page, limit) => {
  const skip = (page - 1) * limit;

  return Promise.all([
    Customer.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(),
  ]);
};

const findById = (id) => Customer.findById(id);

const create = (data) => Customer.create(data);

const updateById = (id, data) => {
  return Customer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteById = (id) => Customer.findByIdAndDelete(id);

export { findPage, findById, create, updateById, deleteById };
