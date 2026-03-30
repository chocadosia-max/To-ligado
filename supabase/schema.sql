-- ============================================================
--  TÔ LIGADO — Schema Supabase
--  Execute no SQL Editor do Supabase
-- ============================================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  whatsapp    TEXT UNIQUE NOT NULL,   -- ex: 5592981134347
  role        TEXT DEFAULT 'user',    -- 'user' | 'partner'
  score       INT  DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- MISSIONS
CREATE TABLE IF NOT EXISTS missions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  scheduled_time  TIME NOT NULL DEFAULT '09:00:00',
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | done | failed | skipped
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- PENALTIES
CREATE TABLE IF NOT EXISTS penalties (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  mission_id  UUID REFERENCES missions(id) ON DELETE CASCADE,
  points      INT  NOT NULL DEFAULT 10,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Índices úteis ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_missions_user_date ON missions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_missions_status    ON missions(status);

-- ── Inserir usuários iniciais (ajuste os números) ──────────
INSERT INTO users (name, whatsapp, role, score) VALUES
  ('Você',     '5592981134347', 'user',    0),
  ('Parceira', '5592999999999', 'partner', 0)
ON CONFLICT (whatsapp) DO NOTHING;
