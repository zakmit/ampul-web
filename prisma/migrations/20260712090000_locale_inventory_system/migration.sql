-- Backfill nullable regular inventory before making it required.
UPDATE "ProductVolume" SET "stock" = 30 WHERE "stock" IS NULL;

ALTER TABLE "ProductVolume"
  ALTER COLUMN "stock" SET DEFAULT 30,
  ALTER COLUMN "stock" SET NOT NULL;

ALTER TABLE "ProductVolume"
  ADD CONSTRAINT "ProductVolume_stock_nonnegative" CHECK ("stock" >= 0);

CREATE TABLE "ProductSampleInventory" (
  "productId" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 30,
  CONSTRAINT "ProductSampleInventory_pkey" PRIMARY KEY ("productId", "locale"),
  CONSTRAINT "ProductSampleInventory_stock_nonnegative" CHECK ("stock" >= 0),
  CONSTRAINT "ProductSampleInventory_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "ProductSampleInventory" ("productId", "locale", "stock")
SELECT p."id", locale, 30
FROM "Product" p
CROSS JOIN (VALUES ('en-US'), ('fr-FR'), ('zh-TW')) AS locales(locale);

ALTER TABLE "Order"
  ADD COLUMN "inventoryRestoredAt" TIMESTAMP(3);

ALTER TABLE "OrderItem"
  ADD COLUMN "inventoryLocale" TEXT,
  ADD COLUMN "inventoryVolumeId" INTEGER;

-- Orders placed before inventory enforcement never deducted stock.
UPDATE "Order" SET "inventoryRestoredAt" = CURRENT_TIMESTAMP;
