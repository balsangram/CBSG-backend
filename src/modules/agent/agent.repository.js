import Agent from "../../model/agent.model.js";
import ExecutiveManagerLevel from "../../model/executiveManagerLevel.model.js";
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

const findLevel = (role, levelId) => {
  const LevelModel =
    role === "executive_manager" ? ExecutiveManagerLevel : TeamLeadLevel;

  return LevelModel.findById(levelId);
};

export { findAll, findById, create, updateById, deleteById, findLevel };
