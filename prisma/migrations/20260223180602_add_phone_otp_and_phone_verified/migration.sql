-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "phone_otps" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "phone_otps_phone_idx" ON "phone_otps"("phone");
