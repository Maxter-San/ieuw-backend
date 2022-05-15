-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "views" INTEGER NOT NULL,
    "photo" TEXT NOT NULL DEFAULT '',
    "starRate" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL DEFAULT 0,
    "salable" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("description", "id", "name", "photo", "price", "salable", "starRate", "views") SELECT "description", "id", "name", "photo", "price", "salable", "starRate", "views" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
