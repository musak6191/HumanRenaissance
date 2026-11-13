-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_artist_portfolio_pictures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artist_id" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "alt_text" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "artist_portfolio_pictures_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_artist_portfolio_pictures"
    ("id", "artist_id", "object_key", "position", "created_at", "updated_at")
SELECT
    lower(hex(randomblob(16))),
    "artist_id",
    "picture",
    "position",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "artist_portfolio_pictures";
DROP TABLE "artist_portfolio_pictures";
ALTER TABLE "new_artist_portfolio_pictures" RENAME TO "artist_portfolio_pictures";
CREATE INDEX "artist_portfolio_pictures_artist_id_position_idx" ON "artist_portfolio_pictures"("artist_id", "position");
CREATE UNIQUE INDEX "artist_portfolio_pictures_artist_id_position_key" ON "artist_portfolio_pictures"("artist_id", "position");
CREATE UNIQUE INDEX "artist_portfolio_pictures_artist_id_object_key_key" ON "artist_portfolio_pictures"("artist_id", "object_key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
