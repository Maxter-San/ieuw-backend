-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "card" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "postcode" INTEGER NOT NULL DEFAULT 0,
    "city" TEXT NOT NULL DEFAULT '',
    "productId" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("address", "city", "email", "id", "lastName", "name", "password", "postcode", "productId") SELECT "address", "city", "email", "id", "lastName", "name", "password", "postcode", "productId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
