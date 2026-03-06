-- ===========================================
-- NURSE-DLE : Script de création de la BDD
-- À exécuter dans l'éditeur SQL de Supabase
-- ===========================================

-- 1. TABLE PROFILES (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_games INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  win_rate INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLE GAME_RESULTS (résultats de chaque partie)
CREATE TABLE IF NOT EXISTS public.game_results (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('classic', 'quote', 'emoji', 'image')),
  pathology_id INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  won BOOLEAN NOT NULL DEFAULT false,
  time_taken REAL,
  played_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Un seul résultat par jour, par mode, par joueur
  UNIQUE (user_id, mode, played_at)
);

-- 3. INDEX pour les requêtes de classement
CREATE INDEX IF NOT EXISTS idx_game_results_daily
  ON public.game_results (mode, played_at, won, attempts);

CREATE INDEX IF NOT EXISTS idx_game_results_user
  ON public.game_results (user_id, played_at);

CREATE INDEX IF NOT EXISTS idx_profiles_ranking
  ON public.profiles (total_wins DESC, win_rate DESC);

-- 4. RLS (Row Level Security) - Sécurité
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- Profiles : lecture publique, modification par le propriétaire uniquement
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Game results : lecture publique (pour les classements), insertion/modification par le propriétaire
CREATE POLICY "Game results are viewable by everyone"
  ON public.game_results FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own results"
  ON public.game_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own results"
  ON public.game_results FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. TRIGGER pour auto-update du champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. FUNCTION pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur la création d'un utilisateur auth
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

