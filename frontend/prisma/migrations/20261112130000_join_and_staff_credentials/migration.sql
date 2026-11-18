ALTER TABLE "AccessRequest" ADD COLUMN "contactNumber" TEXT;
ALTER TABLE "AccessRequest" ADD COLUMN "whatsappNumber" TEXT;

CREATE TABLE "StaffCredential" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "infxName" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "privateCodeHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "claimedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffCredential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffCredential_companyId_staffId_key" ON "StaffCredential"("companyId", "staffId");
CREATE UNIQUE INDEX "StaffCredential_claimedByUserId_key" ON "StaffCredential"("claimedByUserId");
CREATE INDEX "StaffCredential_companyId_active_idx" ON "StaffCredential"("companyId", "active");

ALTER TABLE "StaffCredential" ADD CONSTRAINT "StaffCredential_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffCredential" ADD CONSTRAINT "StaffCredential_claimedByUserId_fkey"
FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
