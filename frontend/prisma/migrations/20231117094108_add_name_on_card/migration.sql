/*
  Warnings:

  - Added the required column `nameOnCard` to the `PaymentMethod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "nameOnCard" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "scores" INTEGER NOT NULL DEFAULT 0;
