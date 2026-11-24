import KYC from "../../../model/kyc.model.js";
import Customer from "../../../model/customer.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findCustomerIdsBySearch = async (search) => {
  const regex = new RegExp(escapeRegex(search), "i");

  const customers = await Customer.find({
    $or: [{ name: regex }, { email: regex }, { phone: regex }],
  }).select("_id");

  return customers.map((customer) => customer._id);
};

const buildFilter = async ({ status, search, customerIds }) => {
  const filter = {};

  if (status) filter.status = status;
  if (customerIds) filter.userId = { $in: customerIds };

  return filter;
};

const countByStatus = () => {
  return KYC.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

const findAll = async ({ page, limit, sort, status, search }) => {
  let customerIds;

  if (search) {
    customerIds = await findCustomerIdsBySearch(search);

    if (!customerIds.length) {
      return { kycs: [], total: 0 };
    }
  }

  const filter = await buildFilter({ status, customerIds });

  const [kycs, total] = await Promise.all([
    KYC.find(filter)
      .populate("userId", "name email phone photo")
      .populate("verifiedBy", "name email")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    KYC.countDocuments(filter),
  ]);

  return { kycs, total };
};

export { countByStatus, findAll };
