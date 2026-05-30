import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../store/useStore";
import Navbar from "../components/Navbar";
import Leaderboard from "../components/Leaderboard";
import MatchCard from "../components/MatchCard";
import Bracket from "../components/Bracket";
import { Trophy, Calendar, ClipboardCheck, LayoutGrid, BarChart3, Search, TrendingUp, HelpCircle, CheckCircle2, Cpu } from "lucide-react";

export default function Dashboard() {
  const { pollId } = useParams();
  const { matches, predictions, standings, currentUser, loadPollData, simulateMatchResult, loading, isDemoMode } = useStore();
  const [activeTab, setActiveTab] = useState("ranking");
  
  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState("");

  // Cargar datos al montar
  useEffect(() => {
    loadPollData(pollId);
  }, [pollId]);

  // Transición de Vista suave
  const handleTabChange = (tabId) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setActiveTab(tabId);
      });
    } else {
      setActiveTab(tabId);
    }
  };

  // Filtrar partidos
  const upcomingMatches = matches.filter(m => m.status === "pending" || m.status === "live");
  const pastMatches = matches.filter(m => m.status === "finished");

  // Filtro de búsqueda por país
  const filterBySearch = (list) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    const teams = useStore.getState().teams;
    
    return list.filter(m => {
      const teamA = teams.find(t => t.id === m.teamAId)?.name.toLowerCase() || m.teamAPlaceholder?.toLowerCase() || "";
      const teamB = teams.find(t => t.id === m.teamBId)?.name.toLowerCase() || m.teamBPlaceholder?.toLowerCase() || "";
      return teamA.includes(query) || teamB.includes(query);
    });
  };

  // Estadísticas personales del usuario
  const myStanding = standings.find(s => s.user_id === currentUser?.id);
  const myRank = standings.findIndex(s => s.user_id === currentUser?.id) + 1;
  const totalPredicted = Object.keys(predictions).length;
  const totalCorrect = myStanding?.correct_predictions || 0;
  const accuracy = totalPredicted > 0 ? Math.round((totalCorrect / totalPredicted) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Banner de Carga */}
        {loading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="glass-card p-6 rounded-2xl border border-brand-cyan/30 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-t-brand-cyan border-white/5 animate-spin"></div>
              <span className="font-outfit text-sm font-extrabold text-white tracking-widest uppercase">Actualizando Estadio...</span>
            </div>
          </div>
        )}

        {/* ====================================================================
            CONTROL DE TABS (Navegación del Dashboard)
            ==================================================================== */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-950/60 border border-brand-border/30 rounded-xl max-w-max mx-auto shadow-md">
          
          <button
            onClick={() => handleTabChange("ranking")}
            className={`flex items-center gap-2 py-2 px-4 md:px-5 rounded-lg text-xs md:text-sm font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "ranking" 
                ? "bg-gradient-to-r from-brand-cyan to-brand-accent text-black shadow-md shadow-brand-cyan/10" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Trophy size={16} />
            <span>📊 Ranking</span>
          </button>

          <button
            onClick={() => handleTabChange("predict")}
            className={`flex items-center gap-2 py-2 px-4 md:px-5 rounded-lg text-xs md:text-sm font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "predict" 
                ? "bg-gradient-to-r from-brand-cyan to-brand-accent text-black shadow-md shadow-brand-cyan/10" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Calendar size={16} />
            <span>🎯 Pronosticar</span>
          </button>

          <button
            onClick={() => handleTabChange("results")}
            className={`flex items-center gap-2 py-2 px-4 md:px-5 rounded-lg text-xs md:text-sm font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "results" 
                ? "bg-gradient-to-r from-brand-cyan to-brand-accent text-black shadow-md shadow-brand-cyan/10" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ClipboardCheck size={16} />
            <span>✅ Resultados</span>
          </button>

          <button
            onClick={() => handleTabChange("bracket")}
            className={`flex items-center gap-2 py-2 px-4 md:px-5 rounded-lg text-xs md:text-sm font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "bracket" 
                ? "bg-gradient-to-r from-brand-cyan to-brand-accent text-black shadow-md shadow-brand-cyan/10" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutGrid size={16} />
            <span>🏆 Bracket</span>
          </button>

          <button
            onClick={() => handleTabChange("stats")}
            className={`flex items-center gap-2 py-2 px-4 md:px-5 rounded-lg text-xs md:text-sm font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "stats" 
                ? "bg-gradient-to-r from-brand-cyan to-brand-accent text-black shadow-md shadow-brand-cyan/10" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <BarChart3 size={16} />
            <span>👤 Mis Stats</span>
          </button>

        </div>

        {/* ====================================================================
            VISTA: 1. RANKING (Leaderboard)
            ==================================================================== */}
        {activeTab === "ranking" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Leaderboard />
          </div>
        )}

        {/* ====================================================================
            VISTA: 2. PRONOSTICAR / PARTIDOS PRÓXIMOS
            ==================================================================== */}
        {activeTab === "predict" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Cabecera y Buscador */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="font-outfit text-lg font-extrabold text-white uppercase tracking-wider">
                  Partidos Disponibles
                </h3>
                <p className="text-xs text-gray-500">
                  Registra o edita tus predicciones. Se cierran automáticamente 15 minutos antes de la hora oficial.
                </p>
              </div>

              {/* Buscador */}
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar país..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-brand-border/60 focus:border-brand-cyan/80 focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 text-xs rounded-lg text-white"
                />
              </div>
            </div>

            {/* Listado de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterBySearch(upcomingMatches).map((match) => {
                const myPred = predictions[match.id];
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    userPrediction={myPred}
                    onSimulateResult={simulateMatchResult}
                  />
                );
              })}

              {filterBySearch(upcomingMatches).length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 italic text-xs bg-slate-950/20 border border-dashed border-white/5 rounded-2xl">
                  No hay partidos próximos disponibles que coincidan con la búsqueda.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ====================================================================
            VISTA: 3. RESULTADOS (PARTIDOS PASADOS)
            ==================================================================== */}
        {activeTab === "results" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="font-outfit text-lg font-extrabold text-white uppercase tracking-wider">
                  Resultados Oficiales
                </h3>
                <p className="text-xs text-gray-500">
                  Partidos disputados. Revisa si lograste sumar el punto por resultado exacto.
                </p>
              </div>

              {/* Buscador */}
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar país..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-brand-border/60 focus:border-brand-cyan/80 focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 text-xs rounded-lg text-white"
                />
              </div>
            </div>

            {/* Tarjetas de Resultados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterBySearch(pastMatches).map((match) => {
                const myPred = predictions[match.id];
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    userPrediction={myPred}
                  />
                );
              })}

              {filterBySearch(pastMatches).length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 italic text-xs bg-slate-950/20 border border-dashed border-white/5 rounded-2xl">
                  Aún no hay partidos finalizados para calificar.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ====================================================================
            VISTA: 4. BRACKET DE ELIMINATORIAS
            ==================================================================== */}
        {activeTab === "bracket" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Bracket />
          </div>
        )}

        {/* ====================================================================
            VISTA: 5. MIS STATS (Estadísticas personales)
            ==================================================================== */}
        {activeTab === "stats" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Cabecera */}
            <div className="border-b border-white/5 pb-3">
              <h3 className="font-outfit text-lg font-extrabold text-white uppercase tracking-wider">
                Resumen de mi Rendimiento
              </h3>
              <p className="text-xs text-gray-500">
                Información detallada de tus aciertos y posicionamiento en tiempo real.
              </p>
            </div>

            {/* Módulos de Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Posición de Ranking */}
              <div className="glass-card p-5 rounded-2xl border border-brand-gold/20 flex items-center justify-between shadow-lg relative overflow-hidden bg-gradient-to-r from-slate-900/40 to-brand-gold/5">
                <div>
                  <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">Puesto en Ranking</span>
                  <div className="font-outfit text-3xl font-black text-white mt-1">#{myRank || "-"}</div>
                </div>
                <Trophy size={40} className="text-brand-gold opacity-30 shrink-0" />
              </div>

              {/* Aciertos exactos */}
              <div className="glass-card p-5 rounded-2xl border border-brand-accent/20 flex items-center justify-between shadow-lg relative overflow-hidden bg-gradient-to-r from-slate-900/40 to-brand-accent/5">
                <div>
                  <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">Aciertos Exactos</span>
                  <div className="font-outfit text-3xl font-black text-white mt-1">{totalCorrect} pts</div>
                </div>
                <CheckCircle2 size={40} className="text-brand-accent opacity-30 shrink-0" />
              </div>

              {/* Total Predicciones */}
              <div className="glass-card p-5 rounded-2xl border border-brand-cyan/20 flex items-center justify-between shadow-lg relative overflow-hidden bg-gradient-to-r from-slate-900/40 to-brand-cyan/5">
                <div>
                  <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Predicciones Hechas</span>
                  <div className="font-outfit text-3xl font-black text-white mt-1">{totalPredicted} / 64</div>
                </div>
                <TrendingUp size={40} className="text-brand-cyan opacity-30 shrink-0" />
              </div>

              {/* Efectividad (%) */}
              <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-lg relative overflow-hidden bg-slate-950/40">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Porcentaje Efectividad</span>
                  <div className="font-outfit text-3xl font-black text-white mt-1">{accuracy}%</div>
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-brand-cyan flex items-center justify-center font-mono text-[10px] font-bold text-brand-cyan shrink-0">
                  %
                </div>
              </div>

            </div>

            {/* Explicación de las Reglas */}
            <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4">
              <h4 className="font-outfit text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle size={16} className="text-brand-cyan" />
                ¿Cómo funciona el Sistema de Puntos?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-400">
                
                <div className="space-y-1.5 p-4 bg-slate-950/30 rounded-xl border border-white/5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand-accent"></div>
                    Binario Directo
                  </div>
                  <p>Solo sumas si aciertas el **resultado exacto** del partido. Si predices 2-1 y queda 2-1, obtienes 1 punto (acierto). Cualquier otro marcador suma 0.</p>
                </div>

                <div className="space-y-1.5 p-4 bg-slate-950/30 rounded-xl border border-white/5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand-cyan"></div>
                    Cierre de Predicciones
                  </div>
                  <p>Tienes libertad absoluta para crear o editar tus predicciones en cualquier momento. Se bloquearán **15 minutos antes** del silbatazo inicial.</p>
                </div>

                <div className="space-y-1.5 p-4 bg-slate-950/30 rounded-xl border border-white/5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                    Desempates de Ranking
                  </div>
                  <p>En caso de empate en puntos, las posiciones en la tabla de clasificación se ordenan alfabéticamente por nombre de usuario. ¡Cada acierto es crucial!</p>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
