/*
  Warnings:

  - You are about to drop the column `url` on the `Image` table. All the data in the column will be lost.
  - Added the required column `lowQualityUrl` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normalUrl` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewUrl` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "url",
ADD COLUMN     "lowQualityUrl" TEXT NOT NULL,
ADD COLUMN     "normalUrl" TEXT NOT NULL,
ADD COLUMN     "previewUrl" TEXT NOT NULL,
ALTER COLUMN "type" SET DATA TYPE TEXT;
