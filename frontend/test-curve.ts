import { generateProjectionCurve, RunInput } from "./lib/deterministicEngine";

const runInput: RunInput = {
  age: 30,
  retirementAge: 60,
  monthlyIncome: 500000,
  monthlyContribution: 50000,
  currentSavings: 0,
  inflationRate: 8,
  growthModel: "balanced",
  incomeType: "seasonal",
  savingBehavior: "consistent",
  lifestyle: "moderate",
  projectionStrategy: "seasonal"
};

const curve = generateProjectionCurve(runInput, 0.08333333333333333); // Monthly
console.log(curve.slice(0, 15));
