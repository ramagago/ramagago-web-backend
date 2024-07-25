-- Prisma Migrate Migration
-- ID: XXXX_add-type-to-image
-- Created At: XXXX-XX-XX XX:XX:XX

-- Add your SQL statements here

ALTER TABLE "Image" ADD COLUMN "type" VARCHAR NOT NULL DEFAULT 'image';

-- Update existing rows with the default value
UPDATE "Image" SET "type" = 'image' WHERE "type" IS NULL;

-- Remove the default value if you don't want it after the initial update
ALTER TABLE "Image" ALTER COLUMN "type" DROP DEFAULT;