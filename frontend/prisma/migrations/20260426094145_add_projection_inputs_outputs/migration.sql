/*
  Warnings:

  - You are about to drop the column `monthlyRetirementIncome` on the `result` table. All the data in the column will be lost.
  - You are about to drop the column `projectedValue` on the `result` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyRetirementIncome` on the `scenarioresult` table. All the data in the column will be lost.
  - You are about to drop the column `projectedValue` on the `scenarioresult` table. All the data in the column will be lost.
  - Added the required column `estimatedMonthlyIncome` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inflationAdjustedValue` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectedSavings` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedMonthlyIncome` to the `ScenarioResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inflationAdjustedValue` to the `ScenarioResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectedSavings` to the `ScenarioResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `growthModel` to the `Simulation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incomeType` to the `Simulation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `savingBehavior` to the `Simulation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `result` DROP COLUMN `monthlyRetirementIncome`,
    DROP COLUMN `projectedValue`,
    ADD COLUMN `confidenceScore` DOUBLE NULL,
    ADD COLUMN `estimatedMonthlyIncome` DOUBLE NOT NULL,
    ADD COLUMN `inflationAdjustedValue` DOUBLE NOT NULL,
    ADD COLUMN `projectedSavings` DOUBLE NOT NULL,
    ADD COLUMN `riskScore` DOUBLE NULL;

-- AlterTable
ALTER TABLE `scenario` ADD COLUMN `extraContribution` DOUBLE NULL,
    ADD COLUMN `growthModel` ENUM('STABLE', 'BALANCED', 'HIGH') NULL,
    ADD COLUMN `includeIrregular` BOOLEAN NULL,
    ADD COLUMN `incomeType` ENUM('STABLE', 'FLEXIBLE', 'SEASONAL') NULL,
    ADD COLUMN `savingBehavior` ENUM('CONSISTENT', 'FLEXIBLE', 'OPPORTUNISTIC') NULL;

-- AlterTable
ALTER TABLE `scenarioresult` DROP COLUMN `monthlyRetirementIncome`,
    DROP COLUMN `projectedValue`,
    ADD COLUMN `confidenceScore` DOUBLE NULL,
    ADD COLUMN `estimatedMonthlyIncome` DOUBLE NOT NULL,
    ADD COLUMN `inflationAdjustedValue` DOUBLE NOT NULL,
    ADD COLUMN `projectedSavings` DOUBLE NOT NULL,
    ADD COLUMN `riskScore` DOUBLE NULL;

-- AlterTable
ALTER TABLE `simulation` ADD COLUMN `extraContribution` DOUBLE NULL,
    ADD COLUMN `growthModel` ENUM('STABLE', 'BALANCED', 'HIGH') NOT NULL,
    ADD COLUMN `includeIrregular` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `incomeType` ENUM('STABLE', 'FLEXIBLE', 'SEASONAL') NOT NULL,
    ADD COLUMN `savingBehavior` ENUM('CONSISTENT', 'FLEXIBLE', 'OPPORTUNISTIC') NOT NULL;
