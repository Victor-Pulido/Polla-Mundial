import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";
import { generateMatches, TEAMS } from "../data/worldCupData";

// Detectar credenciales de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const hasSupabase = supabaseUrl !== "" && supabaseAnonKey !== "";

export const supabase = hasSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Lógica de calificación de predicciones en JS (para Modo Demo)
const calculateIsCorrect = (predScoreA, predScoreB, finalScoreA, finalScoreB) => {
  if (finalScoreA === null || finalScoreB === null) return null;
  return Number(predScoreA) === Number(finalScoreA) && Number(predScoreB) === Number(finalScoreB);
};

export const useStore = create((set, get) => ({
  isDemoMode: !hasSupabase,
  loading: false,
  error: null,
  
  // Estado de la Polla y del Usuario
  activePoll: null,
  currentUser: null,
  
  // Datos del torneo
  teams: TEAMS,
  matches: [],
  users: [],
  predictions: {}, // Predicciones de mi usuario actual: { [matchId]: { scoreA, scoreB, isCorrect } }
  allPredictions: [], // Todas las predicciones de la polla: [{ user_id, match_id, predicted_score_a, predicted_score_b, is_correct }]
  standings: [], // [{ id, username, total_matches, correct_predictions }]

  // 1. Unirse o ingresar a la polla
  joinPoll: async (pollId, username) => {
    set({ loading: true, error: null });
    const cleanUsername = username.trim();
    
    if (get().isDemoMode) {
      // --- MODO DEMO ---
      try {
        const storedUsers = JSON.parse(localStorage.getItem(`demo_users_${pollId}`)) || [];
        let user = storedUsers.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
        
        if (!user) {
          // Crear nuevo usuario
          user = {
            id: `usr-${Math.random().toString(36).substr(2, 9)}`,
            username: cleanUsername,
            joined_at: new Date().toISOString()
          };
          storedUsers.push(user);
          localStorage.setItem(`demo_users_${pollId}`, JSON.stringify(storedUsers));
          
          // Inicializar Standing para este usuario
          const storedStandings = JSON.parse(localStorage.getItem(`demo_standings_${pollId}`)) || [];
          storedStandings.push({
            id: `st-${Math.random().toString(36).substr(2, 9)}`,
            user_id: user.id,
            total_matches: 0,
            correct_predictions: 0,
            updated_at: new Date().toISOString()
          });
          localStorage.setItem(`demo_standings_${pollId}`, JSON.stringify(storedStandings));
        }
        
        // Guardar sesión en LocalStorage
        localStorage.setItem(`current_user_${pollId}`, JSON.stringify(user));
        
        set({ currentUser: user, loading: false });
        await get().loadPollData(pollId);
        return true;
      } catch (err) {
        set({ error: err.message, loading: false });
        return false;
      }
    } else {
      // --- MODO SUPABASE ---
      try {
        // Buscar si existe el usuario en esta polla
        const { data: existingUser, error: findError } = await supabase
          .from("users")
          .select("*")
          .eq("poll_id", pollId)
          .ilike("username", cleanUsername)
          .maybeSingle();

        if (findError) throw findError;

        let user = existingUser;
        if (!user) {
          // Intentar insertar nuevo usuario
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({ poll_id: pollId, username: cleanUsername })
            .select()
            .single();

          if (insertError) {
            if (insertError.code === "23505") {
              set({ error: "Este nombre ya está en uso en esta polla.", loading: false });
              return false;
            }
            throw insertError;
          }
          user = newUser;
        }

        // Guardar sesión en LocalStorage
        localStorage.setItem(`current_user_${pollId}`, JSON.stringify(user));
        set({ currentUser: user, loading: false });
        await get().loadPollData(pollId);
        return true;
      } catch (err) {
        set({ error: err.message, loading: false });
        return false;
      }
    }
  },

  // 2. Cargar todos los datos de la polla
  loadPollData: async (pollId) => {
    set({ loading: true, error: null });
    
    if (get().isDemoMode) {
      // --- MODO DEMO ---
      try {
        // Cargar o inicializar Polla
        let poll = JSON.parse(localStorage.getItem(`demo_poll_${pollId}`));
        if (!poll) {
          poll = { id: pollId, name: `Polla Mundialista ${pollId.toUpperCase()}` };
          localStorage.setItem(`demo_poll_${pollId}`, JSON.stringify(poll));
        }

        // Cargar o inicializar Partidos
        let storedMatches = JSON.parse(localStorage.getItem(`demo_matches_${pollId}`));
        if (!storedMatches) {
          storedMatches = generateMatches();
          
          // Pre-resolver algunos partidos para que el Leaderboard no empiece vacío
          // Resolver los primeros 3 partidos de la Fase de Grupos
          storedMatches[0].status = "finished";
          storedMatches[0].finalScoreA = 2;
          storedMatches[0].finalScoreB = 1;

          storedMatches[1].status = "finished";
          storedMatches[1].finalScoreA = 1;
          storedMatches[1].finalScoreB = 1;

          storedMatches[2].status = "finished";
          storedMatches[2].finalScoreA = 0;
          storedMatches[2].finalScoreB = 2;

          localStorage.setItem(`demo_matches_${pollId}`, JSON.stringify(storedMatches));
        }

        // Cargar o inicializar Usuarios competidores simulados
        let storedUsers = JSON.parse(localStorage.getItem(`demo_users_${pollId}`)) || [];
        if (storedUsers.length === 0) {
          // Agregar contrincantes simulados
          storedUsers = [
            { id: "usr-sim-1", username: "Ana" },
            { id: "usr-sim-2", username: "Juan" },
            { id: "usr-sim-3", username: "Carlos" },
            { id: "usr-sim-4", username: "Sofía" }
          ];
          
          // Si hay un usuario registrado, agregarlo
          const currentUserSession = JSON.parse(localStorage.getItem(`current_user_${pollId}`));
          if (currentUserSession) {
            storedUsers.push(currentUserSession);
          }
          
          localStorage.setItem(`demo_users_${pollId}`, JSON.stringify(storedUsers));
        }

        // Cargar o inicializar Predicciones
        let storedPredictions = JSON.parse(localStorage.getItem(`demo_predictions_${pollId}`)) || [];
        if (storedPredictions.length === 0) {
          // Agregar predicciones simuladas para los competidores
          storedUsers.forEach(u => {
            if (u.id.startsWith("usr-sim-")) {
              // Predecir los primeros partidos
              storedMatches.forEach(m => {
                if (m.stage === "groups") {
                  storedPredictions.push({
                    id: `pred-${Math.random().toString(36).substr(2, 9)}`,
                    user_id: u.id,
                    match_id: m.id,
                    predicted_score_a: Math.floor(Math.random() * 3),
                    predicted_score_b: Math.floor(Math.random() * 3),
                    is_correct: null
                  });
                }
              });
            }
          });
          localStorage.setItem(`demo_predictions_${pollId}`, JSON.stringify(storedPredictions));
        }

        // Calificar predicciones y recalcular standings
        // Calificar predicciones basadas en los partidos resueltos
        storedPredictions.forEach(pred => {
          const match = storedMatches.find(m => m.id === pred.match_id);
          if (match && match.status === "finished") {
            pred.is_correct = calculateIsCorrect(
              pred.predicted_score_a,
              pred.predicted_score_b,
              match.finalScoreA,
              match.finalScoreB
            );
          }
        });
        localStorage.setItem(`demo_predictions_${pollId}`, JSON.stringify(storedPredictions));

        // Calcular Standings
        const demoStandings = storedUsers.map(u => {
          const userPreds = storedPredictions.filter(p => p.user_id === u.id);
          const correct = userPreds.filter(p => p.is_correct === true).length;
          const total = userPreds.filter(p => p.is_correct !== null).length;
          
          return {
            id: `st-${u.id}`,
            user_id: u.id,
            username: u.username,
            total_matches: total,
            correct_predictions: correct,
            updated_at: new Date().toISOString()
          };
        });
        localStorage.setItem(`demo_standings_${pollId}`, JSON.stringify(demoStandings));

        // Extraer predicciones del usuario actual
        const currentUserSession = JSON.parse(localStorage.getItem(`current_user_${pollId}`));
        const myPredictionsObj = {};
        if (currentUserSession) {
          storedPredictions
            .filter(p => p.user_id === currentUserSession.id)
            .forEach(p => {
              myPredictionsObj[p.match_id] = {
                scoreA: p.predicted_score_a,
                scoreB: p.predicted_score_b,
                isCorrect: p.is_correct
              };
            });
        }

        set({
          activePoll: poll,
          currentUser: currentUserSession,
          matches: storedMatches,
          users: storedUsers,
          predictions: myPredictionsObj,
          allPredictions: storedPredictions,
          standings: demoStandings.sort((a, b) => b.correct_predictions - a.correct_predictions || a.username.localeCompare(b.username)),
          loading: false
        });

      } catch (err) {
        set({ error: err.message, loading: false });
      }
    } else {
      // --- MODO SUPABASE ---
      try {
        // Cargar detalles de la polla
        let { data: poll, error: pollError } = await supabase
          .from("polls")
          .select("*")
          .eq("id", pollId)
          .maybeSingle();

        if (pollError) throw pollError;
        
        // Si no existe la polla por alguna razón en MVP, crearla dinámicamente
        if (!poll) {
          const { data: newPoll, error: createPollError } = await supabase
            .from("polls")
            .insert({ id: pollId, name: `Polla Mundial 2026` })
            .select()
            .single();
          if (createPollError) throw createPollError;
          poll = newPoll;
        }

        // Cargar equipos (para asegurar que están en BD)
        const { data: dbTeams } = await supabase.from("teams").select("*");
        if (!dbTeams || dbTeams.length === 0) {
          // Sembrar equipos y partidos si la base de datos está vacía (Admin helper)
          const teamsDataForDb = get().teams.map(t => ({
            id: t.id,
            name: t.name,
            country_code: t.countryCode,
            group_letter: t.groupLetter,
            flag_emoji: t.flag
          }));
          await supabase.from("teams").insert(teamsDataForDb);
          
          const matchesDataForDb = generateMatches().map(m => ({
            id: m.id,
            match_date: m.matchDate,
            team_a_id: m.teamAId,
            team_b_id: m.teamBId,
            stage: m.stage,
            group_letter: m.groupLetter,
            stadium: m.stadium,
            status: m.status,
            final_score_a: m.finalScoreA,
            final_score_b: m.finalScoreB
          }));
          await supabase.from("matches").insert(matchesDataForDb);
        }

        // Cargar partidos ordenados por fecha
        const { data: dbMatches, error: matchesError } = await supabase
          .from("matches")
          .select("*")
          .order("match_date", { ascending: true });

        if (matchesError) throw matchesError;

        // Cargar usuarios
        const { data: dbUsers, error: usersError } = await supabase
          .from("users")
          .select("*")
          .eq("poll_id", pollId);

        if (usersError) throw usersError;

        // Cargar predicciones del usuario actual
        const currentUserSession = JSON.parse(localStorage.getItem(`current_user_${pollId}`));
        let myPredictionsObj = {};
        let allPredictions = [];

        if (currentUserSession) {
          const { data: myPreds } = await supabase
            .from("predictions")
            .select("*")
            .eq("user_id", currentUserSession.id);
          
          if (myPreds) {
            myPreds.forEach(p => {
              myPredictionsObj[p.match_id] = {
                scoreA: p.predicted_score_a,
                scoreB: p.predicted_score_b,
                isCorrect: p.is_correct
              };
            });
          }
        }

        // Cargar todas las predicciones para visualización
        const { data: allPreds } = await supabase
          .from("predictions")
          .select("*");
        if (allPreds) allPredictions = allPreds;

        // Cargar standings ordenados
        const { data: dbStandings, error: standingsError } = await supabase
          .from("standings")
          .select("*, users(username)")
          .eq("poll_id", pollId);

        if (standingsError) throw standingsError;

        const formattedStandings = dbStandings.map(s => ({
          id: s.id,
          user_id: s.user_id,
          username: s.users?.username || "Usuario",
          total_matches: s.total_matches,
          correct_predictions: s.correct_predictions,
          updated_at: s.updated_at
        })).sort((a, b) => b.correct_predictions - a.correct_predictions || a.username.localeCompare(b.username));

        // Adaptar campos de partidos
        const formattedMatches = dbMatches.map(m => ({
          id: m.id,
          matchDate: m.match_date,
          stage: m.stage,
          groupLetter: m.group_letter,
          teamAId: m.team_a_id,
          teamBId: m.team_b_id,
          stadium: m.stadium,
          status: m.status,
          finalScoreA: m.final_score_a,
          finalScoreB: m.final_score_b,
          hasExtraTime: m.has_extra_time,
          wentToPenalties: m.went_to_penalties
        }));

        set({
          activePoll: poll,
          currentUser: currentUserSession,
          matches: formattedMatches,
          users: dbUsers,
          predictions: myPredictionsObj,
          allPredictions: allPredictions,
          standings: formattedStandings,
          loading: false
        });

      } catch (err) {
        set({ error: err.message, loading: false });
      }
    }
  },

  // 3. Guardar o Editar predicción
  savePrediction: async (matchId, scoreA, scoreB) => {
    const { currentUser, activePoll, isDemoMode, matches } = get();
    if (!currentUser || !activePoll) return false;

    // Validar cierre de predicción (15 minutos antes)
    const match = matches.find(m => m.id === matchId);
    if (!match) return false;
    
    const cutoffTime = new Date(match.matchDate).getTime() - 15 * 60 * 1000;
    if (Date.now() > cutoffTime) {
      set({ error: "Las predicciones para este partido se encuentran bloqueadas (cierre 15 min antes)." });
      return false;
    }

    if (isDemoMode) {
      // --- MODO DEMO ---
      try {
        const storedPredictions = JSON.parse(localStorage.getItem(`demo_predictions_${activePoll.id}`)) || [];
        
        // Buscar si ya existe
        const existingPredIdx = storedPredictions.findIndex(
          p => p.user_id === currentUser.id && p.match_id === matchId
        );

        if (existingPredIdx >= 0) {
          storedPredictions[existingPredIdx].predicted_score_a = Number(scoreA);
          storedPredictions[existingPredIdx].predicted_score_b = Number(scoreB);
          storedPredictions[existingPredIdx].updated_at = new Date().toISOString();
        } else {
          storedPredictions.push({
            id: `pred-${Math.random().toString(36).substr(2, 9)}`,
            user_id: currentUser.id,
            match_id: matchId,
            predicted_score_a: Number(scoreA),
            predicted_score_b: Number(scoreB),
            is_correct: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        localStorage.setItem(`demo_predictions_${activePoll.id}`, JSON.stringify(storedPredictions));

        // Actualizar estado local reactivamente
        set(state => ({
          predictions: {
            ...state.predictions,
            [matchId]: {
              scoreA: Number(scoreA),
              scoreB: Number(scoreB),
              isCorrect: null
            }
          }
        }));

        // Forzar recarga de standings y polla
        await get().loadPollData(activePoll.id);
        return true;
      } catch (err) {
        set({ error: err.message });
        return false;
      }
    } else {
      // --- MODO SUPABASE ---
      try {
        const { error } = await supabase
          .from("predictions")
          .upsert({
            user_id: currentUser.id,
            match_id: matchId,
            predicted_score_a: Number(scoreA),
            predicted_score_b: Number(scoreB),
            updated_at: new Date().toISOString()
          }, {
            onConflict: "user_id,match_id"
          });

        if (error) throw error;

        // Actualizar estado local reactivamente
        set(state => ({
          predictions: {
            ...state.predictions,
            [matchId]: {
              scoreA: Number(scoreA),
              scoreB: Number(scoreB),
              isCorrect: null
            }
          }
        }));

        await get().loadPollData(activePoll.id);
        return true;
      } catch (err) {
        set({ error: err.message });
        return false;
      }
    }
  },

  // 4. Simulación de Resultados de Partido (Administrador secreto)
  simulateMatchResult: async (matchId, scoreA, scoreB) => {
    const { activePoll, isDemoMode } = get();
    if (!activePoll) return false;

    if (isDemoMode) {
      // --- MODO DEMO ---
      try {
        const storedMatches = JSON.parse(localStorage.getItem(`demo_matches_${activePoll.id}`)) || [];
        const matchIdx = storedMatches.findIndex(m => m.id === matchId);
        
        if (matchIdx >= 0) {
          storedMatches[matchIdx].status = "finished";
          storedMatches[matchIdx].finalScoreA = Number(scoreA);
          storedMatches[matchIdx].finalScoreB = Number(scoreB);
          
          localStorage.setItem(`demo_matches_${activePoll.id}`, JSON.stringify(storedMatches));
          
          // Recargar todos los datos y recalcular
          await get().loadPollData(activePoll.id);
          return true;
        }
        return false;
      } catch (err) {
        set({ error: err.message });
        return false;
      }
    } else {
      // --- MODO SUPABASE ---
      try {
        const { error } = await supabase
          .from("matches")
          .update({
            status: "finished",
            final_score_a: Number(scoreA),
            final_score_b: Number(scoreB)
          })
          .eq("id", matchId);

        if (error) throw error;

        // Recargar datos (los standings se habrán calculado en BD por el trigger de SQL)
        await get().loadPollData(activePoll.id);
        return true;
      } catch (err) {
        set({ error: err.message });
        return false;
      }
    }
  },

  // 5. Cerrar Sesión
  logout: (pollId) => {
    localStorage.removeItem(`current_user_${pollId}`);
    set({ currentUser: null, predictions: {} });
  }
}));
