/*
  Warnings:

  - You are about to drop the column `baseSimulationId` on the `scenario` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedContribution` on the `scenario` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedRetirementAge` on the `scenario` table. All the data in the column will be lost.
  - Added the required column `simulationId` to the `Scenario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `scenario` DROP COLUMN `baseSimulationId`,
    DROP COLUMN `modifiedContribution`,
    DROP COLUMN `modifiedRetirementAge`,
    ADD COLUMN `age` INTEGER NULL,
    ADD COLUMN `currentSavings` DOUBLE NULL,
    ADD COLUMN `inflationRate` DOUBLE NULL,
    ADD COLUMN `lifestyle` VARCHAR(191) NULL,
    ADD COLUMN `monthlyContribution` DOUBLE NULL,
    ADD COLUMN `monthlyIncome` DOUBLE NULL,
    ADD COLUMN `retirementAge` INTEGER NULL,
    ADD COLUMN `simulationId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ScenarioResult` (
    `id` VARCHAR(191) NOT NULL,
    `scenarioId` VARCHAR(191) NOT NULL,
    `projectedValue` DOUBLE NOT NULL,
    `monthlyRetirementIncome` DOUBLE NOT NULL,
    `rsiScore` DOUBLE NOT NULL,
    `readinessLevel` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ScenarioResult_scenarioId_key`(`scenarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Scenario` ADD CONSTRAINT `Scenario_simulationId_fkey` FOREIGN KEY (`simulationId`) REFERENCES `Simulation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScenarioResult` ADD CONSTRAINT `ScenarioResult_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `Scenario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
