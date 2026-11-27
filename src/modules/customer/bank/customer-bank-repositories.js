import Customer from "../../../model/customer.model.js";

const BANK_FIELDS = "bankName accountNumber ifscCode";

const findCustomerBank = (id) => Customer.findById(id).select(BANK_FIELDS);

const updateCustomerBank = (id, data) => {
  return Customer.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
  }).select(BANK_FIELDS);
};

export { findCustomerBank, updateCustomerBank };
