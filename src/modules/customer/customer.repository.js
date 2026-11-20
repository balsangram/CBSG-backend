import Customer from "../../model/customer.model.js";

const findAll = () => Customer.find().sort({ createdAt: -1 });

const findById = (id) => Customer.findById(id);

const create = (data) => Customer.create(data);

const updateById = (id, data) => {
  return Customer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteById = (id) => Customer.findByIdAndDelete(id);

export { findAll, findById, create, updateById, deleteById };
