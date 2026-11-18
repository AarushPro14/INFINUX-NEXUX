CREATE TABLE "RoleChangeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "RoleChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RoleChangeRequest_userId_status_idx" ON "RoleChangeRequest"("userId", "status");
CREATE INDEX "RoleChangeRequest_companyId_status_idx" ON "RoleChangeRequest"("companyId", "status");

ALTER TABLE "RoleChangeRequest" ADD CONSTRAINT "RoleChangeRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoleChangeRequest" ADD CONSTRAINT "RoleChangeRequest_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
