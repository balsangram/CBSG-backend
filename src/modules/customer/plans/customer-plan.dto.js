const toPlanDto = (plan) => ({
  id: plan._id,
  schemeName: plan.schemeName,
  planType: plan.planType,
  minimumInvestmentAmount: plan.minimumInvestmentAmount,
  payout: plan.payout,
  monthlyInterest: plan.monthlyInterest,
  monthlyInterestDate: plan.monthlyInterestDate || null,
  planRules: (plan.planRules || []).map((rule) => ({
    ruleName: rule.ruleName,
    description: rule.description,
  })),
  isActive: plan.isActive,
});

const toPlanListDto = (plans) => ({
  total: plans.length,
  plans: plans.map(toPlanDto),
});

export { toPlanListDto };
