-- Rename profile identity fields without losing existing values.
ALTER TABLE "artists" RENAME COLUMN "name" TO "family_name";
ALTER TABLE "commissioners" RENAME COLUMN "name" TO "family_name";
