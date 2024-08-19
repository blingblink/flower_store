-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "fromDate" TIMESTAMP(3),
ADD COLUMN     "toDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;
