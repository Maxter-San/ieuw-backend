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
    "salable" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Product" ("description", "id", "name", "photo", "price", "starRate", "views") SELECT "description", "id", "name", "photo", "price", "starRate", "views" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
