/*
  Warnings:

  - You are about to drop the column `image` on the `ProductImage` table. All the data in the column will be lost.
  - Added the required column `src` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "image",
ADD COLUMN     "src" TEXT NOT NULL;
