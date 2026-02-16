-- AlterTable
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "emergencyContact2" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "educationalFiles" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "examinationFiles" TEXT;
