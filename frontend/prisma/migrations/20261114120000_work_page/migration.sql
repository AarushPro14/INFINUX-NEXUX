CREATE TABLE "WorkWorkspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspaceKey" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkWorkspace_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WorkSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WorkSessionMember" (
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkSessionMember_pkey" PRIMARY KEY ("sessionId", "userId")
);
CREATE TABLE "WorkMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkMessage_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WorkQuickReply" (
    "userId" TEXT NOT NULL,
    "replies" TEXT[] NOT NULL,
    CONSTRAINT "WorkQuickReply_pkey" PRIMARY KEY ("userId")
);
CREATE UNIQUE INDEX "WorkWorkspace_workspaceKey_key" ON "WorkWorkspace"("workspaceKey");
CREATE INDEX "WorkWorkspace_companyId_idx" ON "WorkWorkspace"("companyId");
CREATE INDEX "WorkSession_workspaceId_idx" ON "WorkSession"("workspaceId");
CREATE INDEX "WorkSessionMember_userId_idx" ON "WorkSessionMember"("userId");
CREATE INDEX "WorkMessage_sessionId_createdAt_idx" ON "WorkMessage"("sessionId", "createdAt");
ALTER TABLE "WorkWorkspace" ADD CONSTRAINT "WorkWorkspace_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkSession" ADD CONSTRAINT "WorkSession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "WorkWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkSessionMember" ADD CONSTRAINT "WorkSessionMember_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkSessionMember" ADD CONSTRAINT "WorkSessionMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkMessage" ADD CONSTRAINT "WorkMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkQuickReply" ADD CONSTRAINT "WorkQuickReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
