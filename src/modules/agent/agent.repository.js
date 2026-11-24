import Agent from "../../model/agent.model.js";
import Branch from "../../model/branches.model.js";
import ExecutiveManagerLevel from "../../model/executiveManagerLevel.model.js";
import Target from "../../model/target.model.js";
import TeamLeadLevel from "../../model/teamLeadLevel.model.js";

const findAll = () => Agent.find().sort({ createdAt: -1 });

const findById = (id) => Agent.findById(id);

const create = (data) => Agent.create(data);

const updateById = (id, data) => {
  return Agent.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteById = (id) => Agent.findByIdAndDelete(id);

const adjustTotals = (id, { customers = 0, saving = 0 } = {}) => {
  if (!id || (customers === 0 && saving === 0)) return null;

  return Agent.findByIdAndUpdate(id, {
    $inc: {
      totalCustomer: customers,
      totalSaving: saving,
    },
  });
};

const findBranch = (branchId) => Branch.findById(branchId);

const findTarget = (targetId) => Target.findById(targetId);

const findLevel = (role, levelId) => {
  const LevelModel =
    role === "executive_manager" ? ExecutiveManagerLevel : TeamLeadLevel;

  return LevelModel.findById(levelId);
};

export {
  findAll,
  findById,
  create,
  updateById,
  deleteById,
  adjustTotals,
  findBranch,
  findLevel,
  findTarget,
};
