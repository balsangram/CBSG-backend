const toBranchDto = (branch) => ({
  id: branch._id,
  name: branch.name,
  city: branch.city,
  createdAt: branch.createdAt,
  updatedAt: branch.updatedAt,
});

const toBranchListDto = (branches) => branches.map(toBranchDto);

export { toBranchDto, toBranchListDto };
