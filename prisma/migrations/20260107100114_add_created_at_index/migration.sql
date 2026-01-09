-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastOrderAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- CreateIndex
CREATE INDEX "User_lastOrderAt_idx" ON "User"("lastOrderAt");
