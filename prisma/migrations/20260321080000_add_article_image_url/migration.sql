-- Add imageUrl for Article images
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
