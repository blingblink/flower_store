/*
  Warnings:

  - You are about to drop the column `paymentId` on the `Shipment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_paymentId_fkey";

-- AlterTable
ALTER TABLE "Shipment" DROP COLUMN "paymentId";
