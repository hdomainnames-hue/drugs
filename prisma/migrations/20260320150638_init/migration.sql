-- CreateTable
CREATE TABLE "Drug" (
    "id" BIGSERIAL NOT NULL,
    "remoteId" INTEGER NOT NULL,
    "url" TEXT,
    "name" TEXT NOT NULL,
    "price" TEXT,
    "company" TEXT,
    "activeIngredient" TEXT,
    "description" TEXT,
    "metaDescription" TEXT,
    "imageSourceUrl" TEXT,
    "imageLocalPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugSimilar" (
    "id" BIGSERIAL NOT NULL,
    "fromDrugId" BIGINT NOT NULL,
    "toDrugId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrugSimilar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" BIGSERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" BIGSERIAL NOT NULL,
    "lang" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drug_remoteId_key" ON "Drug"("remoteId");

-- CreateIndex
CREATE INDEX "Drug_name_idx" ON "Drug"("name");

-- CreateIndex
CREATE INDEX "Drug_company_idx" ON "Drug"("company");

-- CreateIndex
CREATE INDEX "Drug_activeIngredient_idx" ON "Drug"("activeIngredient");

-- CreateIndex
CREATE INDEX "DrugSimilar_toDrugId_idx" ON "DrugSimilar"("toDrugId");

-- CreateIndex
CREATE UNIQUE INDEX "DrugSimilar_fromDrugId_toDrugId_key" ON "DrugSimilar"("fromDrugId", "toDrugId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_lang_publishedAt_idx" ON "Article"("lang", "publishedAt");

-- CreateIndex
CREATE INDEX "Faq_lang_order_idx" ON "Faq"("lang", "order");

-- AddForeignKey
ALTER TABLE "DrugSimilar" ADD CONSTRAINT "DrugSimilar_fromDrugId_fkey" FOREIGN KEY ("fromDrugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrugSimilar" ADD CONSTRAINT "DrugSimilar_toDrugId_fkey" FOREIGN KEY ("toDrugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;
