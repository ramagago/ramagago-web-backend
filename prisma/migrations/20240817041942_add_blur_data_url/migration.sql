/*
  Warnings:

  - You are about to drop the column `previewUrl` on the `Image` table. All the data in the column will be lost.
  - Added the required column `blurDataURL` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN "blurDataURL" TEXT DEFAULT '';
