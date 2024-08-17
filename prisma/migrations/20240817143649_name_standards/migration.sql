/*
  Warnings:

  - You are about to drop the column `blurDataURL` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `videoPreviewURL` on the `Image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "blurDataURL",
DROP COLUMN "videoPreviewURL",
ADD COLUMN     "blurDataUrl" TEXT,
ADD COLUMN     "videoPreviewUrl" TEXT;
