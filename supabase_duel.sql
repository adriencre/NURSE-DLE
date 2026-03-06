-- ===========================================
-- NURSE-DLE : Tables pour le Mode Duel
-- À exécuter dans l'éditeur SQL de Supabase
-- ===========================================

-- 1. TABLE DUEL_ROOMS (salons de jeu)
CREATE TABLE IF NOT EXISTS public.duel_rooms (
  id TEXT PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 6),
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  max_players INTEGER NOT NULL DEFAULT 2 CHECK (max_players >= 2 AND max_players <= 10),
  wins_needed INTEGER NOT NULL DEFAULT 5 CHECK (wins_needed >= 1 AND wins_needed <= 10),
  current_round INTEGER NOT NULL DEFAULT 0,
  current_pathology_id INTEGER,
  round_winner_id UUID REFERENCES public.profiles(id),
  round_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLE DUEL_PLAYERS (joueurs dans un salon)
CREATE TABLE IF NOT EXISTS public.duel_players (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id TEXT REFERENCES public.duel_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  has_found BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (room_id, user_id)
);

-- 3. INDEX
CREATE INDEX IF NOT EXISTS idx_duel_rooms_status ON public.duel_rooms (status);
CREATE INDEX IF NOT EXISTS idx_duel_players_room ON public.duel_players (room_id);
CREATE INDEX IF NOT EXISTS idx_duel_players_user ON public.duel_players (user_id);

-- 4. RLS
ALTER TABLE public.duel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_players ENABLE ROW LEVEL SECURITY;

-- Rooms : lecture publique, création par authentifiés, update par l'hôte
CREATE POLICY "Duel rooms are viewable by everyone"
  ON public.duel_rooms FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON public.duel_rooms FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update room"
  ON public.duel_rooms FOR UPDATE
  USING (auth.uid() = host_id);

-- Players : lecture publique, insertion/update par le joueur lui-même
CREATE POLICY "Duel players are viewable by everyone"
  ON public.duel_players FOR SELECT USING (true);

CREATE POLICY "Users can join rooms"
  ON public.duel_players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player entry"
  ON public.duel_players FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON public.duel_players FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Realtime : Activer la publication pour les tables duel
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_players;

-- 6. Trigger updated_at pour duel_rooms
CREATE TRIGGER duel_rooms_updated_at
  BEFORE UPDATE ON public.duel_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

