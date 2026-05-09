/*
  Warnings:

  - The values [MODERATE] on the enum `Scenario_scenarioType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `recommendation` ADD COLUMN `engineType` VARCHAR(191) NULL,
    ADD COLUMN `explanation` VARCHAR(191) NULL,
    ADD COLUMN `featureImpacts` JSON NULL;

-- AlterTable
ALTER TABLE `result` ADD COLUMN `consistencyScore` DOUBLE NULL,
    ADD COLUMN `inflationVulnerability` DOUBLE NULL,
    ADD COLUMN `readinessScore` DOUBLE NULL,
    ADD COLUMN `sustainabilityScore` DOUBLE NULL,
    ADD COLUMN `volatilityScore` DOUBLE NULL;

-- AlterTable
ALTER TABLE `scenario` MODIFY `scenarioType` ENUM('CONSERVATIVE', 'BALANCED', 'AGGRESSIVE', 'INFORMAL', 'SEASONAL', 'INFLATION_STRESS', 'CONTRIBUTION_GROWTH', 'EARLY_RETIREMENT', 'SUSTAINABILITY', 'CUSTOM') NULL;

-- AlterTable
ALTER TABLE `scenarioresult` ADD COLUMN `consistencyScore` DOUBLE NULL,
    ADD COLUMN `inflationVulnerability` DOUBLE NULL,
    ADD COLUMN `readinessScore` DOUBLE NULL,
    ADD COLUMN `sustainabilityScore` DOUBLE NULL,
    ADD COLUMN `volatilityScore` DOUBLE NULL;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `read` BOOLEAN NOT NULL DEFAULT false,
    `linkUrl` VARCHAR(191) NULL,
    `linkText` VARCHAR(191) NULL,
    `isGlobal` BOOLEAN NOT NULL DEFAULT false,
    `targetRole` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `readAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StrategyComparison` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `baseSimulationId` VARCHAR(191) NOT NULL,
    `strategiesCompared` JSON NOT NULL,
    `bestStrategy` VARCHAR(191) NOT NULL,
    `worstStrategy` VARCHAR(191) NOT NULL,
    `averageRsiScore` DOUBLE NOT NULL,
    `bestRsiScore` DOUBLE NOT NULL,
    `worstRsiScore` DOUBLE NOT NULL,
    `spreadRsiScore` DOUBLE NOT NULL,
    `averageProjectedSavings` DOUBLE NOT NULL,
    `bestProjectedSavings` DOUBLE NOT NULL,
    `worstProjectedSavings` DOUBLE NOT NULL,
    `spreadProjectedSavings` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MLModelVersion` (
    `id` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `modelType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `accuracyR2` DOUBLE NULL,
    `accuracyMse` DOUBLE NULL,

    UNIQUE INDEX `MLModelVersion_version_key`(`version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
