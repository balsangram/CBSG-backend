import Plan from "../../../model/plans.model.js";

const findActivePlans = () => {
  return Plan.find().sort({ createdAt: -1 });
};

export { findActivePlans };
