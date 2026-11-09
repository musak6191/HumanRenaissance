ALTER TABLE "art_groups" ADD COLUMN "owner_id" TEXT;

CREATE INDEX "art_groups_owner_id_idx" ON "art_groups"("owner_id");

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_art_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner_id" TEXT,
    "art_style" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    CONSTRAINT "new_art_groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "registrations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_art_groups" ("id", "owner_id", "art_style", "visibility")
SELECT "id", "owner_id", "art_style", "visibility" FROM "art_groups";

DROP TABLE "art_groups";
ALTER TABLE "new_art_groups" RENAME TO "art_groups";

CREATE UNIQUE INDEX "art_groups_art_style_key" ON "art_groups"("art_style");
CREATE INDEX "art_groups_owner_id_idx" ON "art_groups"("owner_id");

PRAGMA foreign_keys=ON;
