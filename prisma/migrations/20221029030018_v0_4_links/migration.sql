-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "title" TEXT,
    "description" TEXT,
    "image" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "clicksUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Link_domain_archived_expiresAt_createdAt_idx" ON "Link"("domain", "archived", "expiresAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Link_domain_archived_expiresAt_clicks_idx" ON "Link"("domain", "archived", "expiresAt", "clicks" DESC);

-- CreateIndex
CREATE INDEX "Link_domain_archived_expiresAt_userId_createdAt_idx" ON "Link"("domain", "archived", "expiresAt", "userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Link_domain_archived_expiresAt_userId_clicks_idx" ON "Link"("domain", "archived", "expiresAt", "userId", "clicks" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Link_domain_key_key" ON "Link"("domain", "key");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_domain_fkey" FOREIGN KEY ("domain") REFERENCES "Project"("domain") ON DELETE CASCADE ON UPDATE CASCADE;
