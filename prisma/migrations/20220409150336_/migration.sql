/*
  Warnings:

  - You are about to drop the column `cantidad` on the `UserCartItem` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `UserCartItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserCartItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userCartId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "UserCartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserCartItem_userCartId_fkey" FOREIGN KEY ("userCartId") REFERENCES "UserCart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserCartItem" ("id", "productId", "userCartId") SELECT "id", "productId", "userCartId" FROM "UserCartItem";
DROP TABLE "UserCartItem";
ALTER TABLE "new_UserCartItem" RENAME TO "UserCartItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
