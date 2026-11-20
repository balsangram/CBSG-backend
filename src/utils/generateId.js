
import { randomUUID } from "crypto";

const generateId = (prefix = "CBSG") => {
  return `${prefix}-${randomUUID()}`;
};

export default generateId;
