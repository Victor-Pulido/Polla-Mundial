import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../store/useStore";
import Navbar from "../components/Navbar";
import Leaderboard from "../components/Leaderboard";
import MatchCard from "../components/MatchCard";
import Bracket from "../components/Bracket";
import { Trophy, Calendar, ClipboardCheck, LayoutGrid, BarChart3, Search, TrendingUp, HelpCircle, CheckCircle2 } from "lucide-react";

const TABS = [
  { id: "ranking",  label: "Ranking",     icon: <Trophy size={15} aria-hidden="true" />,         emoji: "📊" },
  { id: "predict",  label: "Pronosticar", icon: <Calendar size={15} aria-hidden="true" />,        emoji: "🎯" },
  { id: "results",  label: "Resultados",  icon: <ClipboardCheck size={15} aria-hidden="true" />,  emoji: "✅" },
  { id: "bracket",  label: "Bracket",     icon: <LayoutGrid size={15} aria-hidden="true" />,      emoji: "🏆" },
  { id: "stats",    label: "Mis Stats",   icon: <BarChart3 size={15} aria-hidden="true" />,       emoji: "👤" },
];

export default function Dashboard() {
  const { pollId } = useParams();
  const { matches, predictions, standings, currentUser, loadPollData, simulateMatchResult, loading, isDemoMode } = useStore();
  const [activeTab, setActiveTab] = useState("ranking");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPollData(pollId);
  }, [pollId]);

  const handleTabChange = (tabId) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setActiveTab(tabId));
    } else {
      setActiveTab(tabId);
    }
  };

  const upcomingMatches = matches.filter(m => m.status === "pending" || m.status === "live");
  const pastMatches     = matches.filter(m => m.status === "finished");

  const filterBySearch = (list) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    const teams = useStore.getState().teams;
    return list.filter(m => {
      const a = teams.find(t => t.id === m.teamAId)?.name.toLowerCase() || m.teamAPlaceholder?.toLowerCase() || "";
      const b = teams.find(t => t.id === m.teamBId)?.name.toLowerCase() || m.teamBPlaceholder?.toLowerCase() || "";
      return a.includes(query) || b.includes(query);
    });
  };

  const myStanding    = standings.find(s => s.user_id === currentUser?.id);
  const myRank        = standings.findIndex(s => s.user_id === currentUser?.id) + 1;
  const totalPredicted = Object.keys(predictions).length;
  const totalCorrect  = myStanding?.correct_predictions || 0;
  const accuracy      = totalPredicted > 0 ? Math.round((totalCorrect / totalPredicted) * 100) : 0;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Loading overlay */}
        {loading && (
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
            role="status"
            aria-label="Actualizando datos"
          >
            <div className="glass-card p-6 rounded-xl flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-t-brand-cyan border-brand-border animate-spin" aria-hidden="true"></div>
              <span className="font-inter text-sm font-bold text-brand-text tracking-widest uppercase">
                Actualizando Estadio...
              </span>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div
          role="tablist"
          aria-label="Secciones del dashboard"
          className="flex overflow-x-auto gap-1.5 p-1 bg-brand-card border border-brand-border rounded-xl max-w-max mx-auto"
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-brand-cyan text-slate-900 shadow-sm"
                    : "text-brand-text-secondary hover:text-brand-text hover:bg-brand-card-hover"
                }`}
              >
                {tab.icon}
                <span aria-hidden="true">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel: Ranking */}
        <div
          role="tabpanel"
          id="panel-ranking"
          aria-labelledby="tab-ranking"
          hidden={activeTab !== "ranking"}
          className="animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {activeTab === "ranking" && <Leaderboard />}
        </div>

        {/* Panel: Pronosticar */}
        <div
          role="tabpanel"
          id="panel-predict"
          aria-labelledby="tab-predict"
          hidden={activeTab !== "predict"}
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {activeTab === "predict" && (
            <>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-brand-border pb-4">
                <div>
                  <h3 className="font-outfit text-lg font-extrabold text-brand-text uppercase tracking-wide">
                    Partidos Disponibles
                  </h3>
                  <p className="text-sm text-brand-text-secondary mt-0.5">
                    Registra o edita tus predicciones. Se cierran 15 minutos antes del partido.
                  </p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Buscar equipo..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label="Buscar partido por equipo"
                    className="w-full pl-9 pr-4 py-2 bg-brand-card border border-brand-border focus:border-brand-border-active focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 text-sm rounded-lg text-brand-text placeholder-brand-text-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filterBySearch(upcomingMatches).map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    userPrediction={predictions[match.id]}
                    onSimulateResult={simulateMatchResult}
                  />
                ))}
                {filterBySearch(upcomingMatches).length === 0 && (
                  <div className="col-span-full text-center py-12 text-brand-text-muted text-sm bg-brand-card border border-dashed border-brand-border rounded-xl">
                    No hay partidos disponibles que coincidan con la búsqueda.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Panel: Resultados */}
        <div
          role="tabpanel"
          id="panel-results"
          aria-labelledby="tab-results"
          hidden={activeTab !== "results"}
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {activeTab === "results" && (
            <>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-brand-border pb-4">
                <div>
                  <h3 className="font-outfit text-lg font-extrabold text-brand-text uppercase tracking-wide">
                    Resultados Oficiales
                  </h3>
                  <p className="text-sm text-brand-text-secondary mt-0.5">
                    Partidos disputados. Revisa si lograste el punto por resultado exacto.
                  </p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Buscar equipo..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label="Buscar resultado por equipo"
                    className="w-full pl-9 pr-4 py-2 bg-brand-card border border-brand-border focus:border-brand-border-active focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 text-sm rounded-lg text-brand-text placeholder-brand-text-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filterBySearch(pastMatches).map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    userPrediction={predictions[match.id]}
                  />
                ))}
                {filterBySearch(pastMatches).length === 0 && (
                  <div className="col-span-full text-center py-12 text-brand-text-muted text-sm bg-brand-card border border-dashed border-brand-border rounded-xl">
                    Aún no hay partidos finalizados.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Panel: Bracket */}
        <div
          role="tabpanel"
          id="panel-bracket"
          aria-labelledby="tab-bracket"
          hidden={activeTab !== "bracket"}
          className="animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {activeTab === "bracket" && <Bracket />}
        </div>

        {/* Panel: Mis Stats */}
        <div
          role="tabpanel"
          id="panel-stats"
          aria-labelledby="tab-stats"
          hidden={activeTab !== "stats"}
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {activeTab === "stats" && (
            <>
              <div className="border-b border-brand-border pb-3">
                <h3 className="font-outfit text-lg font-extrabold text-brand-text uppercase tracking-wide">
                  Mi Rendimiento
                </h3>
                <p className="text-sm text-brand-text-secondary mt-0.5">
                  Aciertos y posicionamiento en tiempo real.
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-xl border-brand-gold/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-gold uppercase tracking-wide">Posición</span>
                    <div className="font-outfit text-3xl font-black text-brand-text mt-1">#{myRank || "—"}</div>
                  </div>
                  <Trophy size={36} className="text-brand-gold/30 shrink-0" aria-hidden="true" />
                </div>

                <div className="glass-card p-5 rounded-xl border-brand-accent/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-accent uppercase tracking-wide">Aciertos</span>
                    <div className="font-outfit text-3xl font-black text-brand-text mt-1">{totalCorrect}</div>
                  </div>
                  <CheckCircle2 size={36} className="text-brand-accent/30 shrink-0" aria-hidden="true" />
                </div>

                <div className="glass-card p-5 rounded-xl border-brand-cyan/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-cyan uppercase tracking-wide">Predicciones</span>
                    <div className="font-outfit text-3xl font-black text-brand-text mt-1">{totalPredicted}<span className="text-base font-medium text-brand-text-muted">/64</span></div>
                  </div>
                  <TrendingUp size={36} className="text-brand-cyan/30 shrink-0" aria-hidden="true" />
                </div>

                <div className="glass-card p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-text-secondary uppercase tracking-wide">Efectividad</span>
                    <div className="font-outfit text-3xl font-black text-brand-text mt-1">{accuracy}%</div>
                  </div>
                  <BarChart3 size={36} className="text-brand-border shrink-0" aria-hidden="true" />
                </div>
              </div>

              {/* Reglas */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h4 className="font-outfit text-sm font-extrabold text-brand-text uppercase tracking-wide flex items-center gap-2">
                  <HelpCircle size={15} className="text-brand-cyan" aria-hidden="true" />
                  Sistema de Puntos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-brand-text-secondary">

                  <div className="space-y-1.5 p-4 bg-brand-bg rounded-lg border border-brand-border">
                    <div className="font-semibold text-brand-text flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-brand-accent" aria-hidden="true"></div>
                      Resultado Exacto
                    </div>
                    <p>Predice el marcador exacto y sumas 1 punto. Cualquier otro resultado suma 0.</p>
                  </div>

                  <div className="space-y-1.5 p-4 bg-brand-bg rounded-lg border border-brand-border">
                    <div className="font-semibold text-brand-text flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-brand-cyan" aria-hidden="true"></div>
                      Cierre Automático
                    </div>
                    <p>Edita tus predicciones cuando quieras. Se bloquean 15 minutos antes del partido.</p>
                  </div>

                  <div className="space-y-1.5 p-4 bg-brand-bg rounded-lg border border-brand-border">
                    <div className="font-semibold text-brand-text flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-brand-gold" aria-hidden="true"></div>
                      Desempate
                    </div>
                    <p>Empate en puntos se resuelve alfabéticamente por nombre de usuario.</p>
                  </div>

                </div>
              </div>
            </>
          )}
        </div>

      </main>
    </div>
  );
}
