-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "userRole" TEXT;

-- CreateIndex
CREATE INDEX "Discount_isActive_idx" ON "Discount"("isActive");

-- CreateIndex
CREATE INDEX "Discount_fromDate_toDate_idx" ON "Discount"("fromDate", "toDate");

-- CreateIndex
CREATE INDEX "Discount_userRole_idx" ON "Discount"("userRole");
