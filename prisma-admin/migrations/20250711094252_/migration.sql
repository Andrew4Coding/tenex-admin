-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isRootAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserModelPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canUpdate" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT NOT NULL,

    CONSTRAINT "UserModelPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserModelPermission_userId_key" ON "UserModelPermission"("userId");

-- AddForeignKey
ALTER TABLE "UserModelPermission" ADD CONSTRAINT "UserModelPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
