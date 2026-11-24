const toTargetDto = (target) => ({
  id: target._id,
  name: target.name,
  amount: target.amount,
  customer: target.customer,
  price: target.price,
  levelNo: target.levelNo,
  role: target.role,
  isActive: target.isActive,
  createdAt: target.createdAt,
  updatedAt: target.updatedAt,
});

const toTargetListDto = (targets) => targets.map(toTargetDto);

export { toTargetDto, toTargetListDto };
