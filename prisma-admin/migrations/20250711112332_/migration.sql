/*
  Warnings:

  - You are about to drop the column `userId` on the `UserModelPermission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[allowedUserId]` on the table `UserModelPermission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `allowedUserId` to the `UserModelPermission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserModelPermission" DROP CONSTRAINT "UserModelPermission_userId_fkey";

-- DropIndex
DROP INDEX "UserModelPermission_userId_key";

-- AlterTable
ALTER TABLE "UserModelPermission" DROP COLUMN "userId",
ADD COLUMN     "allowedUserId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "allowed_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "allowed_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "allowed_user_email_key" ON "allowed_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserModelPermission_allowedUserId_key" ON "UserModelPermission"("allowedUserId");

-- AddForeignKey
ALTER TABLE "allowed_user" ADD CONSTRAINT "allowed_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserModelPermission" ADD CONSTRAINT "UserModelPermission_allowedUserId_fkey" FOREIGN KEY ("allowedUserId") REFERENCES "allowed_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
