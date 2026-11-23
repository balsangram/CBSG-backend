import { toPlanListDto } from "./customer-plan.dto.js";
import { findActivePlans } from "./customer-plan.repository.js";

const getActivePlans = async () => {
  const plans = await findActivePlans();
  return toPlanListDto(plans);
};

export { getActivePlans };
