-- ============================================================
-- Tô Ligado — Schema Completo (v2)
-- Cole este script no Supabase → SQL Editor e execute
-- ============================================================

-- ① Tabela de Perfis (configurações do usuário)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT DEFAULT 'Soldado',
  wife_name TEXT DEFAULT 'Comandante',
  wife_phone TEXT DEFAULT '',
  user_phone TEXT DEFAULT '',
  sarcasm_level INTEGER DEFAULT 50,
  last_med_time TEXT DEFAULT '10:45',
  husband_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- ← NOVO: Link para o marido (se for conta da patroa)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ② Tabela de Missões
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  pts INTEGER DEFAULT 10,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ③ Tabela de Timeline (Histórico de eventos)
CREATE TABLE IF NOT EXISTS timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  content TEXT NOT NULL,
  time_display TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'critical', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ④ Tabela de Agenda
CREATE TABLE IF NOT EXISTS agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  month TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pendente' CHECK (status IN ('urgente', 'pendente', 'safe')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) — cada usuário só vê seus dados
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;

-- Policies: Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id OR auth.uid() = husband_id OR id = (SELECT husband_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR id = (SELECT husband_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies: Missions
DROP POLICY IF EXISTS "Users can manage own missions" ON missions;
CREATE POLICY "Users can manage own missions" ON missions FOR ALL USING (auth.uid() = user_id OR user_id = (SELECT husband_id FROM profiles WHERE id = auth.uid()));

-- Policies: Timeline
DROP POLICY IF EXISTS "Users can manage own timeline" ON timeline;
CREATE POLICY "Users can manage own timeline" ON timeline FOR ALL USING (auth.uid() = user_id OR user_id = (SELECT husband_id FROM profiles WHERE id = auth.uid()));

-- Policies: Agenda
DROP POLICY IF EXISTS "Users can manage own agenda" ON agenda;
CREATE POLICY "Users can manage own agenda" ON agenda FOR ALL USING (auth.uid() = user_id OR user_id = (SELECT husband_id FROM profiles WHERE id = auth.uid()));

-- ============================================================
-- Trigger: auto-cria perfil quando novo usuário cadastra
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, user_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Soldado'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
