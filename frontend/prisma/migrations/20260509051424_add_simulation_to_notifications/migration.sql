-- AlterTable
ALTER TABLE `notification` ADD COLUMN `simulationId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_simulationId_fkey` FOREIGN KEY (`simulationId`) REFERENCES `Simulation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
