-- DropForeignKey
ALTER TABLE `recommendation` DROP FOREIGN KEY `Recommendation_simulationId_fkey`;

-- DropIndex
DROP INDEX `Recommendation_simulationId_fkey` ON `recommendation`;

-- AlterTable
ALTER TABLE `recommendation` ADD COLUMN `scenarioId` VARCHAR(191) NULL,
    MODIFY `simulationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `scenario` ADD COLUMN `scenarioType` ENUM('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'CUSTOM') NULL;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Recommendation` ADD CONSTRAINT `Recommendation_simulationId_fkey` FOREIGN KEY (`simulationId`) REFERENCES `Simulation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recommendation` ADD CONSTRAINT `Recommendation_scenarioId_fkey` FOREIGN KEY (`scenarioId`) REFERENCES `Scenario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
