-- ====================================================================
-- SCRIPT DE BASE DE DATOS: POLLA DEL MUNDIAL 2026
-- Ejecuta este script en el editor SQL de Supabase para inicializar tu base de datos.
-- ====================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: POLLAS (Sweepstakes)
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABLA: USERS (Usuarios dentro de una polla)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  username VARCHAR(50) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(poll_id, username) -- Nombre único por polla
);

-- 3. TABLA: TEAMS (Selecciones nacionales)
CREATE TABLE teams (
  id VARCHAR(20) PRIMARY KEY, -- Usamos códigos abreviados ("bra", "arg")
  name VARCHAR(100) NOT NULL UNIQUE,
  country_code VARCHAR(2) NOT NULL,
  group_letter CHAR(1) NOT NULL,
  flag_emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABLA: MATCHES (Partidos del mundial)
CREATE TABLE matches (
  id VARCHAR(20) PRIMARY KEY, -- "m-1", "oct-1", "final"
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  team_a_id VARCHAR(20) REFERENCES teams(id),
  team_b_id VARCHAR(20) REFERENCES teams(id),
  stage VARCHAR(20) NOT NULL, -- "groups", "octavos", "quarters", "semis", "third_place", "final"
  group_letter CHAR(1),
  stadium VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- pending, live, finished
  final_score_a INT,
  final_score_b INT,
  has_extra_time BOOLEAN DEFAULT false NOT NULL,
  went_to_penalties BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABLA: PREDICTIONS (Predicciones de los usuarios)
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  match_id VARCHAR(20) REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  predicted_score_a INT NOT NULL,
  predicted_score_b INT NOT NULL,
  is_correct BOOLEAN DEFAULT NULL, -- NULL = pendiente, TRUE = acierto, FALSE = fallo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, match_id)
);

-- 6. TABLA: STANDINGS (Tabla de posiciones consolidada por polla)
CREATE TABLE standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  total_matches INT DEFAULT 0 NOT NULL,
  correct_predictions INT DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ====================================================================
-- INDICES PARA OPTIMIZAR EL RENDIMIENTO
-- ====================================================================
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_users_poll ON users(poll_id);
CREATE INDEX idx_standings_poll ON standings(poll_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) Y POLITICAS DE ACCESO
-- Para un grupo de amigos, permitimos la lectura libre y controlamos la escritura.
-- ====================================================================

-- Polla
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Admin Insert Polls" ON polls FOR INSERT WITH CHECK (true);

-- Usuarios
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);
CREATE POLICY "Self Insert Users" ON users FOR INSERT WITH CHECK (true);

-- Equipos
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Teams" ON teams FOR SELECT USING (true);

-- Partidos
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Admin Modify Matches" ON matches FOR ALL USING (true); -- Permitimos operaciones admin

-- Predicciones
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Self Insert Predictions" ON predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "Self Update Predictions" ON predictions FOR UPDATE USING (true);

-- Standings
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Standings" ON standings FOR SELECT USING (true);
CREATE POLICY "System Handle Standings" ON standings FOR ALL USING (true);

-- ====================================================================
-- TRIGGERS Y FUNCIONES PARA CALCULO AUTOMATICO DE ACIERTOS Y STANDINGS
-- ====================================================================

-- Función para calificar predicciones de un partido recién finalizado
CREATE OR REPLACE FUNCTION qualify_predictions_on_match_finished()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'finished' AND (OLD.status IS DISTINCT FROM 'finished') THEN
    -- Actualizar todas las predicciones de este partido
    UPDATE predictions
    SET is_correct = (predicted_score_a = NEW.final_score_a AND predicted_score_b = NEW.final_score_b),
        updated_at = NOW()
    WHERE match_id = NEW.id;
    
    -- Regenerar los standings para todos los usuarios que predijeron este partido
    INSERT INTO standings (poll_id, user_id, total_matches, correct_predictions, updated_at)
    SELECT 
      u.poll_id,
      p.user_id,
      COUNT(p.id) as total_matches,
      SUM(CASE WHEN p.is_correct = true THEN 1 ELSE 0 END) as correct_predictions,
      NOW()
    FROM predictions p
    JOIN users u ON u.id = p.user_id
    WHERE p.match_id = NEW.id
    GROUP BY u.poll_id, p.user_id
    ON CONFLICT (user_id) DO UPDATE
    SET 
      total_matches = EXCLUDED.total_matches,
      correct_predictions = EXCLUDED.correct_predictions,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_qualify_predictions
  AFTER UPDATE OF status ON matches
  FOR EACH ROW
  EXECUTE FUNCTION qualify_predictions_on_match_finished();

-- Función para inicializar standings cuando se une un usuario
CREATE OR REPLACE FUNCTION init_user_standings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO standings (poll_id, user_id, total_matches, correct_predictions, updated_at)
  VALUES (NEW.poll_id, NEW.id, 0, 0, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_init_user_standings
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION init_user_standings();
