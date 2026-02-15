-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "birthCertificateId" TEXT,
    "city" TEXT NOT NULL,
    "placeOfLiving" TEXT,
    "birthDate" TEXT,
    "address" TEXT,
    "nationalIdPhoto" TEXT,
    "birthCertificatePhoto" TEXT,
    "bloodType" TEXT,
    "diabetesType" TEXT,
    "examinationLink" TEXT,
    "emergencyContact" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_qrCodeId_key" ON "Patient"("qrCodeId");
