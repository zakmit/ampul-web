-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "lastFour" CHAR(4),
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'demo';
