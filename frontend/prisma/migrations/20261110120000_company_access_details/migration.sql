ALTER TABLE "Company" ADD COLUMN "code" TEXT;
CREATE UNIQUE INDEX "Company_code_key" ON "Company"("code");

ALTER TABLE "AccessRequest" ADD COLUMN "requesterName" TEXT;
ALTER TABLE "AccessRequest" ADD COLUMN "requesterEmail" TEXT;
ALTER TABLE "AccessRequest" ADD COLUMN "message" TEXT;
ALTER TABLE "AccessRequest" ADD COLUMN "notificationSentAt" TIMESTAMP(3);
