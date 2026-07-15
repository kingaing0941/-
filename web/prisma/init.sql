-- Neon SQL Editor에 붙여넣고 Run 하세요. (한 번만)

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "image" TEXT,
  "officeCode" TEXT,
  "schoolCode" TEXT,
  "schoolName" TEXT,
  "xp" INTEGER NOT NULL DEFAULT 0,
  "level" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Review" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "officeCode" TEXT NOT NULL,
  "schoolCode" TEXT NOT NULL,
  "schoolName" TEXT NOT NULL,
  "mealDate" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Review_userId_schoolCode_mealDate_key"
  ON "Review"("userId", "schoolCode", "mealDate");

CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");
CREATE INDEX IF NOT EXISTS "Review_mealDate_idx" ON "Review"("mealDate");
CREATE INDEX IF NOT EXISTS "Review_schoolCode_isPublic_idx" ON "Review"("schoolCode", "isPublic");
CREATE INDEX IF NOT EXISTS "Review_isPublic_idx" ON "Review"("isPublic");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Review_userId_fkey'
  ) THEN
    ALTER TABLE "Review"
      ADD CONSTRAINT "Review_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
