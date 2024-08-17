/*
  Warnings:

  - You are about to drop the column `previewUrl` on the `Image` table. All the data in the column will be lost.
  - Made the column `blurDataURL` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "previewUrl",
ALTER COLUMN "blurDataURL" SET NOT NULL,
ALTER COLUMN "blurDataURL" DROP DEFAULT;
