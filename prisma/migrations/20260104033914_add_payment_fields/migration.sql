-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "isFreeSample" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "productVolume" DROP NOT NULL;
