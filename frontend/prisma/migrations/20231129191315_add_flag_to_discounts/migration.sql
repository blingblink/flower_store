/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Discount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Discount_code_idx" ON "Discount"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_code_key" ON "Discount"("code");
