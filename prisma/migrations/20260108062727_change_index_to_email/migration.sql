-- DropIndex
DROP INDEX "Order_userId_idx";

-- CreateIndex
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");
