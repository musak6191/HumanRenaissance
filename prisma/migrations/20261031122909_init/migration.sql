-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "artists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "surname" TEXT,
    "name" TEXT,
    "biography" TEXT,
    "city" TEXT,
    "zip_code" TEXT,
    "country" TEXT
);

-- CreateTable
CREATE TABLE "artist_portfolio_pictures" (
    "artist_id" TEXT NOT NULL,
    "picture" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    PRIMARY KEY ("artist_id", "position"),
    CONSTRAINT "artist_portfolio_pictures_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "commissioners" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "surname" TEXT,
    "name" TEXT,
    "biography" TEXT,
    "city" TEXT,
    "zip_code" TEXT,
    "country" TEXT
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commissioner_id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "budget" REAL,
    "timeline" TEXT,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "fusion_commission" BOOLEAN NOT NULL DEFAULT false,
    "entered_at" DATETIME NOT NULL,
    "started_at" DATETIME,
    CONSTRAINT "commissions_commissioner_id_fkey" FOREIGN KEY ("commissioner_id") REFERENCES "commissioners" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "commission_artists" (
    "commission_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,

    PRIMARY KEY ("commission_id", "artist_id"),
    CONSTRAINT "commission_artists_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "commission_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "commission_applicants" (
    "commission_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,

    PRIMARY KEY ("commission_id", "artist_id"),
    CONSTRAINT "commission_applicants_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "commission_applicants_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "art_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "art_style" TEXT NOT NULL,
    "visibility" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "art_group_interests" (
    "art_group_id" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    PRIMARY KEY ("art_group_id", "position"),
    CONSTRAINT "art_group_interests_art_group_id_fkey" FOREIGN KEY ("art_group_id") REFERENCES "art_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "art_group_artists" (
    "art_group_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,

    PRIMARY KEY ("art_group_id", "artist_id"),
    CONSTRAINT "art_group_artists_art_group_id_fkey" FOREIGN KEY ("art_group_id") REFERENCES "art_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "art_group_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artist_id" TEXT NOT NULL,
    "commissioner_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL,
    CONSTRAINT "chats_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chats_commissioner_id_fkey" FOREIGN KEY ("commissioner_id") REFERENCES "commissioners" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chat_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_type" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "picture" TEXT,
    "speech_memo" TEXT,
    "sent_at" DATETIME NOT NULL,
    CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "registrations_email_key" ON "registrations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "artist_portfolio_pictures_artist_id_picture_key" ON "artist_portfolio_pictures"("artist_id", "picture");

-- CreateIndex
CREATE INDEX "commissions_commissioner_id_idx" ON "commissions"("commissioner_id");

-- CreateIndex
CREATE INDEX "commission_artists_artist_id_idx" ON "commission_artists"("artist_id");

-- CreateIndex
CREATE INDEX "commission_applicants_artist_id_idx" ON "commission_applicants"("artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "art_groups_art_style_key" ON "art_groups"("art_style");

-- CreateIndex
CREATE UNIQUE INDEX "art_group_interests_art_group_id_interest_key" ON "art_group_interests"("art_group_id", "interest");

-- CreateIndex
CREATE UNIQUE INDEX "art_group_artists_artist_id_key" ON "art_group_artists"("artist_id");

-- CreateIndex
CREATE INDEX "art_group_artists_artist_id_idx" ON "art_group_artists"("artist_id");

-- CreateIndex
CREATE INDEX "chats_artist_id_idx" ON "chats"("artist_id");

-- CreateIndex
CREATE INDEX "chats_commissioner_id_idx" ON "chats"("commissioner_id");

-- CreateIndex
CREATE INDEX "messages_chat_id_sent_at_idx" ON "messages"("chat_id", "sent_at");
