/*
  Warnings:

  - Made the column `shipmentId` on table `ShipmentLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ShipmentLog" ALTER COLUMN "shipmentId" SET NOT NULL;
