/*
  Warnings:

  - You are about to drop the column `starRate` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "views" INTEGER NOT NULL,
    "photo" TEXT NOT NULL DEFAULT '',
    "categoryId" INTEGER NOT NULL DEFAULT 0,
    "salable" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "description", "id", "name", "photo", "price", "salable", "views") SELECT "categoryId", "description", "id", "name", "photo", "price", "salable", "views" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
