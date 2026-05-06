-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "buttonText" TEXT NOT NULL DEFAULT 'Shop Now',
    "buttonLink" TEXT NOT NULL DEFAULT '/shop',
    "image" TEXT NOT NULL,
    "bgColor" TEXT,
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "position" TEXT NOT NULL DEFAULT 'home',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PageBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "page" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "value" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PageBlock_page_section_key_key" ON "PageBlock"("page", "section", "key");
