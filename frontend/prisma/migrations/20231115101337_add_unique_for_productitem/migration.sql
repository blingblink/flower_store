/*
  Warnings:

  - A unique constraint covering the columns `[productId,shoppingCartId]` on the table `ProductItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductItem_productId_shoppingCartId_key" ON "ProductItem"("productId", "shoppingCartId");
