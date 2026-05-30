import React from "react";
import { useStore } from "../store/useStore";
import { Award, Trophy, Eye } from "lucide-react";

export default function Bracket() {
  const { matches, teams, predictions } = useStore();

  // 1. Calcular Standings de Grupos Simulados/Reales
  // Para Fase de Grupos, agrupamos los equipos y sumamos puntos ficticios basados en resultados finalizados
  const getGroupStandings = (groupLetter) => {
    const groupTeams = teams.filter(t => t.groupLetter === groupLetter);
    const groupMatches = matches.filter(m => m.stage === "groups" && m.groupLetter === groupLetter);

    // Inicializar stats
    const standings = groupTeams.map(t => ({
      ...t,
      pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0
    }));

    groupMatches.forEach(m => {
      if (m.status === "finished") {
        const tA = standings.find(t => t.id === m.teamAId);
        const tB = standings.find(t => t.id === m.teamBId);
        if (tA && tB) {
          tA.pj += 1;
          tB.pj += 1;
          tA.gf += m.finalScoreA;
          tA.gc += m.finalScoreB;
          tB.gf += m.finalScoreB;
          tB.gc += m.finalScoreA;

          if (m.finalScoreA > m.finalScoreB) {
            tA.pg += 1;
            tA.pts += 3;
            tB.pp += 1;
          } else if (m.finalScoreA < m.finalScoreB) {
            tB.pg += 1;
            tB.pts += 3;
            tA.pp += 1;
          } else {
            tA.pe += 1;
            tB.pe += 1;
            tA.pts += 1;
            tB.pts += 1;
          }
        }
      }
    });

    // Ordenar por: Puntos (PTS) -> Diferencia Goles -> Goles Favor
    return standings.sort((a, b) => {
      const difA = a.gf - a.gc;
      const difB = b.gf - b.gc;
      return b.pts - a.pts || difB - difA || b.gf - a.gf;
    });
  };

  // Grupos del A al H
  const groupsList = ["A", "B", "C", "D", "E", "F", "G", "H"];

  // 2. Auxiliar para obtener el partido del Bracket
  const renderBracketMatch = (matchId, label) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return null;

    const teamA = teams.find(t => t.id === match.teamAId);
    const teamB = teams.find(t => t.id === match.teamBId);
    const pred = predictions[matchId];

    return (
      <div className="flex flex-col gap-1 w-full max-w-[210px] group transition-all duration-300">
        
        {/* Etiqueta del Partido */}
        <div className="flex justify-between items-center px-2 py-0.5 bg-slate-900 border-t border-r border-l border-brand-border/30 rounded-t-lg text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          <span>{label}</span>
          {pred && (
            <span className="text-brand-cyan select-none">
              Pred: {pred.scoreA}-{pred.scoreB}
            </span>
          )}
        </div>

        {/* Módulo de Partido de la Llave */}
        <div className="bg-slate-950/80 border border-brand-border/40 group-hover:border-brand-cyan/40 p-2.5 rounded-b-lg flex flex-col gap-1.5 shadow-md transition-all duration-300">
          
          {/* Equipo A */}
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm select-none">{teamA?.flag || "🏳️"}</span>
              <span className={`truncate ${teamA ? "text-white font-extrabold" : "text-gray-500 font-medium"}`}>
                {teamA?.name || match.teamAPlaceholder}
              </span>
            </div>
            {match.status === "finished" && (
              <span className="font-outfit font-black text-brand-gold">{match.finalScoreA}</span>
            )}
          </div>

          {/* Divisor */}
          <div className="h-[1px] bg-white/5"></div>

          {/* Equipo B */}
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm select-none">{teamB?.flag || "🏳️"}</span>
              <span className={`truncate ${teamB ? "text-white font-extrabold" : "text-gray-500 font-medium"}`}>
                {teamB?.name || match.teamBPlaceholder}
              </span>
            </div>
            {match.status === "finished" && (
              <span className="font-outfit font-black text-brand-gold">{match.finalScoreB}</span>
            )}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      
      {/* ====================================================================
          1. SECCIÓN: FASE DE GRUPOS (8 GRUPOS)
          ==================================================================== */}
      <div>
        <div className="border-b border-white/5 pb-3 mb-6">
          <h3 className="font-outfit text-lg font-extrabold text-white uppercase tracking-wider">
            Fase de Grupos (Clasificados)
          </h3>
          <p className="text-xs text-gray-500">
            Los dos mejores de cada grupo (resaltados en verde) avanzan a las Eliminatorias directas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {groupsList.map(letter => {
            const table = getGroupStandings(letter);

            return (
              <div key={letter} className="glass-card rounded-xl border border-brand-border/40 overflow-hidden shadow-lg flex flex-col justify-between">
                
                {/* Cabecera del grupo */}
                <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                  <span className="font-outfit text-sm font-black text-white uppercase">
                    Grupo {letter}
                  </span>
                  <span className="text-[9px] text-brand-cyan tracking-wider font-semibold uppercase">
                    2026 Fixture
                  </span>
                </div>

                {/* Tabla de clasificación */}
                <div className="p-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                        <th className="pb-1.5">Pos</th>
                        <th className="pb-1.5">Equipo</th>
                        <th className="pb-1.5 text-center">PTS</th>
                        <th className="pb-1.5 text-center">PJ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {table.map((team, index) => {
                        const qualifies = index < 2; // Pasan los 2 primeros
                        const rowBg = qualifies 
                          ? "bg-brand-accent/5 font-semibold" 
                          : "opacity-75";

                        return (
                          <tr key={team.id} className={`${rowBg} transition-all`}>
                            {/* Posición */}
                            <td className="py-2 pl-1 font-mono text-[10px]">
                              {qualifies ? (
                                <span className="font-bold text-brand-accent">{index + 1}°</span>
                              ) : (
                                <span className="text-gray-500">{index + 1}°</span>
                              )}
                            </td>
                            {/* Equipo */}
                            <td className="py-2 flex items-center gap-1.5 truncate max-w-[120px]">
                              <span className="text-sm select-none">{team.flag}</span>
                              <span className={`truncate text-white ${qualifies ? "font-extrabold" : ""}`}>{team.name}</span>
                            </td>
                            {/* PTS */}
                            <td className="py-2 text-center font-outfit font-black text-white">
                              {team.pts}
                            </td>
                            {/* PJ */}
                            <td className="py-2 text-center font-mono text-[10px] text-gray-400">
                              {team.pj}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          2. SECCIÓN: BRACKET DE ELIMINATORIAS (ÁRBOL DIGITAL)
          ==================================================================== */}
      <div>
        <div className="border-b border-white/5 pb-3 mb-8">
          <h3 className="font-outfit text-lg font-extrabold text-white uppercase tracking-wider">
            Llave de Eliminatorias
          </h3>
          <p className="text-xs text-gray-500">
            Predicciones del bracket. Haz hover sobre cada partido para ver tus pronósticos.
          </p>
        </div>

        {/* Contenedor del Bracket Scrollable Horizontal */}
        <div className="overflow-x-auto pb-6 select-none">
          <div className="min-w-[960px] flex justify-between items-stretch py-4 px-2 gap-4">
            
            {/* 1. OCTAVOS DE FINAL (Izquierda) */}
            <div className="flex flex-col justify-around gap-6 py-2 shrink-0">
              <div className="text-center border-b border-brand-cyan/20 pb-1.5 mb-2"><span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">Octavos de Final</span></div>
              {renderBracketMatch("oct-1", "Octavos 1")}
              {renderBracketMatch("oct-2", "Octavos 2")}
              {renderBracketMatch("oct-3", "Octavos 3")}
              {renderBracketMatch("oct-4", "Octavos 4")}
            </div>

            {/* 2. CUARTOS DE FINAL (Izquierda-Centro) */}
            <div className="flex flex-col justify-around gap-12 py-8 shrink-0">
              <div className="text-center border-b border-brand-cyan/20 pb-1.5 mb-2"><span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">Cuartos</span></div>
              {renderBracketMatch("qtr-1", "Cuartos 1")}
              {renderBracketMatch("qtr-2", "Cuartos 2")}
            </div>

            {/* 3. SEMIFINALES (Centro-Izquierda) */}
            <div className="flex flex-col justify-around py-12 shrink-0">
              <div className="text-center border-b border-brand-cyan/20 pb-1.5 mb-2"><span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">Semifinal</span></div>
              {renderBracketMatch("semi-1", "Semifinal 1")}
            </div>

            {/* 4. GRAN FINAL + 3ER LUGAR (Centro) */}
            <div className="flex flex-col justify-center items-center gap-12 py-6 shrink-0 bg-white/5 rounded-2xl border border-white/5 p-6 min-w-[240px]">
              
              {/* Campeón Header */}
              <div className="text-center flex flex-col items-center gap-1 animate-float">
                <div className="p-3 bg-brand-gold/15 border border-brand-gold/30 rounded-full text-brand-gold shadow-lg shadow-brand-gold/10">
                  <Trophy size={40} />
                </div>
                <span className="text-[11px] font-outfit font-black tracking-widest text-brand-gold uppercase mt-2">Campeón Mundial 2026</span>
              </div>

              {/* Gran Final */}
              {renderBracketMatch("final", "Gran Final 🏆")}

              {/* Divisor */}
              <div className="w-full h-[1px] bg-white/5"></div>

              {/* 3er Lugar */}
              {renderBracketMatch("third_place", "Tercer Puesto 🥉")}

            </div>

            {/* 5. SEMIFINALES (Centro-Derecha) */}
            <div className="flex flex-col justify-around py-12 shrink-0">
              <div className="text-center border-b border-brand-cyan/20 pb-1.5 mb-2"><span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">Semifinal</span></div>
              {renderBracketMatch("semi-2", "Semifinal 2")}
            </div>

            {/* 6. CUARTOS DE FINAL (Derecha-Centro) */}
            <div className="flex flex-col justify-around gap-12 py-8 shrink-0">
              <div className="text-center border-b border-brand-cyan/20 pb-1.5 mb-2"><span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">Cuartos</span></div>
              {renderBracketMatch("qtr-3", "Cuartos 3")}
              {renderBracketMatch("qtr-4", "Cuartos 4")}
            </div>

            {/* 7. OCTAVOS DE FINAL (Derecha) */}
            <div className="flex flex-col justify-around gap-6 py-2 shrink-0">
              <div className="text-center border-b border-brand-cyan/20 pb-1.5 mb-2"><span className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">Octavos de Final</span></div>
              {renderBracketMatch("oct-5", "Octavos 5")}
              {renderBracketMatch("oct-6", "Octavos 6")}
              {renderBracketMatch("oct-7", "Octavos 7")}
              {renderBracketMatch("oct-8", "Octavos 8")}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
