-- Human Renaissance relational schema.
-- The API currently keeps data in memory; this schema is SQLite-compatible
-- and can be used when the routes are backed by persistent storage.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  surname TEXT,
  name TEXT,
  biography TEXT,
  city TEXT,
  zip_code TEXT,
  country TEXT
);

CREATE TABLE IF NOT EXISTS artist_portfolio_pictures (
  artist_id TEXT NOT NULL,
  picture TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position BETWEEN 0 AND 3),
  PRIMARY KEY (artist_id, position),
  UNIQUE (artist_id, picture),
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS commissioners (
  id TEXT PRIMARY KEY,
  surname TEXT,
  name TEXT,
  biography TEXT,
  city TEXT,
  zip_code TEXT,
  country TEXT
);

CREATE TABLE IF NOT EXISTS commissions (
  id TEXT PRIMARY KEY,
  commissioner_id TEXT NOT NULL,
  prompt TEXT NOT NULL CHECK (length(trim(prompt)) > 0),
  budget NUMERIC,
  timeline TEXT,
  started INTEGER NOT NULL DEFAULT 0 CHECK (started IN (0, 1)),
  fusion_commission INTEGER NOT NULL DEFAULT 0 CHECK (fusion_commission IN (0, 1)),
  entered_at TEXT NOT NULL,
  started_at TEXT,
  FOREIGN KEY (commissioner_id) REFERENCES commissioners(id) ON DELETE CASCADE
);

-- artistIds in the commission API represents accepted artists.
CREATE TABLE IF NOT EXISTS commission_artists (
  commission_id TEXT NOT NULL,
  artist_id TEXT NOT NULL,
  PRIMARY KEY (commission_id, artist_id),
  FOREIGN KEY (commission_id) REFERENCES commissions(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

-- applicantIds is present in the sample commission payload and is kept
-- separately from accepted artists.
CREATE TABLE IF NOT EXISTS commission_applicants (
  commission_id TEXT NOT NULL,
  artist_id TEXT NOT NULL,
  PRIMARY KEY (commission_id, artist_id),
  FOREIGN KEY (commission_id) REFERENCES commissions(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS art_groups (
  id TEXT PRIMARY KEY,
  art_style TEXT NOT NULL UNIQUE COLLATE NOCASE,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private', 'invitation'))
);

CREATE TABLE IF NOT EXISTS art_group_interests (
  art_group_id TEXT NOT NULL,
  interest TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position BETWEEN 0 AND 2),
  PRIMARY KEY (art_group_id, position),
  UNIQUE (art_group_id, interest),
  FOREIGN KEY (art_group_id) REFERENCES art_groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS art_group_artists (
  art_group_id TEXT NOT NULL,
  artist_id TEXT NOT NULL UNIQUE,
  PRIMARY KEY (art_group_id, artist_id),
  FOREIGN KEY (art_group_id) REFERENCES art_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  commissioner_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY (commissioner_id) REFERENCES commissioners(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('artist', 'commissioner')),
  type TEXT NOT NULL CHECK (type IN ('text', 'picture', 'speechMemo')),
  content TEXT,
  picture TEXT,
  speech_memo TEXT,
  sent_at TEXT NOT NULL,
  CHECK (
    (type = 'text' AND length(trim(content)) > 0 AND picture IS NULL AND speech_memo IS NULL)
    OR
    (type = 'picture' AND length(trim(picture)) > 0 AND content IS NULL AND speech_memo IS NULL)
    OR
    (type = 'speechMemo' AND length(trim(speech_memo)) > 0 AND content IS NULL AND picture IS NULL)
  ),
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_commissions_commissioner_id
  ON commissions (commissioner_id);

CREATE INDEX IF NOT EXISTS idx_commission_artists_artist_id
  ON commission_artists (artist_id);

CREATE INDEX IF NOT EXISTS idx_commission_applicants_artist_id
  ON commission_applicants (artist_id);

CREATE INDEX IF NOT EXISTS idx_art_group_artists_artist_id
  ON art_group_artists (artist_id);

CREATE INDEX IF NOT EXISTS idx_chats_artist_id
  ON chats (artist_id);

CREATE INDEX IF NOT EXISTS idx_chats_commissioner_id
  ON chats (commissioner_id);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id_sent_at
  ON messages (chat_id, sent_at);
