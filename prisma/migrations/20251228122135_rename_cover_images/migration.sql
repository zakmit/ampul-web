-- AlterTable: Rename cover image columns in Collection table
ALTER TABLE "Collection" RENAME COLUMN "coverImageDesktop" TO "coverImage1x1";
ALTER TABLE "Collection" RENAME COLUMN "coverImageMobile" TO "coverImage16x9";

-- AlterTable: Rename cover image columns in Product table
ALTER TABLE "Product" RENAME COLUMN "coverImageDesktop" TO "coverImage1x1";
ALTER TABLE "Product" RENAME COLUMN "coverImageMobile" TO "coverImage16x9";
