-- ─── UXUI Guide Schema ──────────────────────────
-- Run this in Supabase SQL editor (Dashboard → SQL Editor → New Query)

CREATE TABLE platforms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT '📖',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE steps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  number      TEXT NOT NULL DEFAULT '00',
  title       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id     UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'default',
  label       TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE block_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id    UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'default',
  text        TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- ─── Row Level Security (공개 읽기/쓰기, 추후 auth 추가 가능) ──
ALTER TABLE platforms   ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps       ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON platforms   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON steps       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON blocks      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON block_items FOR ALL USING (true) WITH CHECK (true);
