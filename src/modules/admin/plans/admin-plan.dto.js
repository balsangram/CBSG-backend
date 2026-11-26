const toPlanDto = (plan) => ({
  id: plan._id,
  schemeName: plan.schemeName,
  planType: plan.planType,
  minimumInvestmentAmount: plan.minimumInvestmentAmount,
  payout: plan.payout,
  monthlyInterest: plan.monthlyInterest,
  monthlyInterestDate: plan.monthlyInterestDate || null,
  preClosureRule: plan.preClosureRule || "",
  planRules: (plan.planRules || []).map((rule) => ({
    ruleName: rule.ruleName,
    description: rule.description,
  })),
  isActive: plan.isActive,
  status: plan.status,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
});

const toPlanListDto = (plans) => plans.map(toPlanDto);

export { toPlanDto, toPlanListDto };
