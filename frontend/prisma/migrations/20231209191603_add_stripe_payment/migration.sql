-- CreateTable
CREATE TABLE "StripePayment" (
    "id" SERIAL NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" INTEGER,

    CONSTRAINT "StripePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StripePayment_stripeCheckoutSessionId_idx" ON "StripePayment"("stripeCheckoutSessionId");

-- AddForeignKey
ALTER TABLE "StripePayment" ADD CONSTRAINT "StripePayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
