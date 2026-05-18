// Test script for ML compliance system
const { buildDeterministicProjection } = require('./lib/deterministicEngine.ts');

console.log('Testing ML Compliance System...\n');

// Test Case 1: Formal Sector with Early Retirement (should apply penalty)
console.log('=== Test Case 1: Formal Sector + Early Retirement ===');
const formalEarlyRetirement = {
  age: 35,
  retirementAge: 45, // 5 years below statutory age
  monthlyIncome: 500000,
  monthlyContribution: 50000,
  currentSavings: 1500000,
  inflationRate: 8,
  projectionStrategy: 'balanced',
  growthModel: 'balanced',
  incomeType: 'stable',
  savingBehavior: 'consistent',
  lifestyle: 'moderate'
};

const result1 = buildDeterministicProjection(formalEarlyRetirement);
console.log('Strategy:', result1.meta.projectionStrategy);
console.log('Is Formal Sector:', result1.meta.isFormalSector);
console.log('Early Retirement Penalty:', (result1.meta.earlyRetirementPenalty * 100).toFixed(1) + '%');
console.log('Compliance Warning:', result1.meta.complianceWarning);
console.log('Projected Savings:', result1.projectedSavings.toLocaleString());
console.log('');

// Test Case 2: Informal Sector with Early Retirement (should NOT apply penalty)
console.log('=== Test Case 2: Informal Sector + Early Retirement ===');
const informalEarlyRetirement = {
  ...formalEarlyRetirement,
  projectionStrategy: 'informal'
};

const result2 = buildDeterministicProjection(informalEarlyRetirement);
console.log('Strategy:', result2.meta.projectionStrategy);
console.log('Is Formal Sector:', result2.meta.isFormalSector);
console.log('Early Retirement Penalty:', result2.meta.earlyRetirementPenalty || 0);
console.log('Compliance Warning:', result2.meta.complianceWarning || 'None');
console.log('Projected Savings:', result2.projectedSavings.toLocaleString());
console.log('');

// Test Case 3: Formal Sector with Normal Retirement (should NOT apply penalty)
console.log('=== Test Case 3: Formal Sector + Normal Retirement ===');
const formalNormalRetirement = {
  ...formalEarlyRetirement,
  retirementAge: 55 // Above statutory age
};

const result3 = buildDeterministicProjection(formalNormalRetirement);
console.log('Strategy:', result3.meta.projectionStrategy);
console.log('Is Formal Sector:', result3.meta.isFormalSector);
console.log('Early Retirement Penalty:', result3.meta.earlyRetirementPenalty || 0);
console.log('Compliance Warning:', result3.meta.complianceWarning || 'None');
console.log('Projected Savings:', result3.projectedSavings.toLocaleString());
console.log('');

console.log('✅ Compliance system test completed!');
