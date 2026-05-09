/*
  Add name fields to Simulation and Scenario tables for better organization
  This migration handles existing data by providing defaults
*/

-- Add name column to Simulation table with default for existing rows
ALTER TABLE `simulation` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT 'Untitled Simulation';

-- Add name column to Scenario table with default for existing rows  
ALTER TABLE `scenario` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT 'Untitled Scenario';
