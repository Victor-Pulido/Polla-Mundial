import React from "react";
import { useStore } from "../store/useStore";
import { Trophy } from "lucide-react";

export default function Bracket() {
  const { matches, teams, predictions } = useStore();

  const getGroupStandings = (groupLetter) => {
    const groupTeams   = teams.filter(t => t.groupLetter === groupLetter);
    const groupMatches = matches.filter(m => m.stage === "groups" && m.groupLetter === groupLetter);

    const standings = groupTeams.map(t => ({
      ...t, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0
    }));

    groupMatches.forEach(m => {
      if (m.status !== "finished") return;
      const tA = standings.find(t => t.id === m.teamAId);
      const tB = standings.find(t => t.id === m.teamBId);
      if (!tA || !tB) return;
      tA.pj++; tB.pj++;
      tA.gf += m.finalScoreA; tA.gc += m.finalScoreB;
      tB.gf += m.finalScoreB; tB.gc += m.finalScoreA;
      if (m.finalScoreA > m.finalScoreB) { tA.pg++; tA.pts += 3; tB.pp++; }
      else if (m.finalScoreA < m.finalScoreB) { tB.pg++; tB.pts += 3; tA.pp++; }
      else { tA.pe++; tB.pe++; tA.pts++; tB.pts++; }
    });

    return standings.sort((a, b) => {
      const dA = a.gf - a.gc, dB = b.gf - b.gc;
      return b.pts - a.pts || dB - dA || b.gf - a.gf;
    });
  };

  const groupsList = ["A", "B", "C", "D", "E", "F", "G", "H"];

  const renderBracketMatch = (matchId, label) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return null;

    const teamA = teams.find(t => t.id === match.teamAId);
    const teamB = teams.find(t => t.id === match.teamBId);
    const pred  = predictions[matchId];

    return (
      <div className="flex flex-col gap-0.5 w-full max-w-[210px]">

        {/* Match label */}
        <div className="flex justify-between items-center px-2 py-1 bg-brand-card border border-b-0 border-brand-border rounded-t-lg text-xs font-bold text-brand-text-muted uppercase tracking-wider">
          <span>{label}</span>
          {pred && (
            <span className="text-brand-cyan font-mono text-xs" aria-label={`Tu predicción: ${pred.scoreA}–${pred.scoreB}`}>
              {pred.scoreA}–{pred.scoreB}
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="bg-brand-card border border-brand-border hover:border-brand-border-active p-2.5 rounded-b-lg flex flex-col gap-1.5 transition-colors">

          <div className="flex items-center justify-between text-sm font-semibold">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base select-none" role="img" aria-label={teamA?.name || "Equipo A"}>{teamA?.flag || "🏳️"}</span>
              <span className={`truncate ${teamA ? "text-brand-text font-extrabold" : "text-brand-text-muted"}`}>
                {teamA?.name || match.teamAPlaceholder}
              </span>
            </div>
            {match.status === "finished" && (
              <span className="font-outfit font-black text-brand-gold ml-2 shrink-0">{match.finalScoreA}</span>
            )}
          </div>

          <div className="h-px bg-brand-border"></div>

          <div className="flex items-center justify-between text-sm font-semibold">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base select-none" role="img" aria-label={teamB?.name || "Equipo B"}>{teamB?.flag || "🏳️"}</span>
              <span className={`truncate ${teamB ? "text-brand-text font-extrabold" : "text-brand-text-muted"}`}>
                {teamB?.name || match.teamBPlaceholder}
              </span>
            </div>
            {match.status === "finished" && (
              <span className="font-outfit font-black text-brand-gold ml-2 shrink-0">{match.finalScoreB}</span>
            )}
          </div>

        </div>
      </div>
    );
  };

  const PhaseLabel = ({ label }) => (
    <div className="text-center border-b border-brand-border pb-1.5 mb-2">
      <span className="text-xs font-bold text-brand-cyan uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="space-y-12">

      {/* Group stage */}
      <section aria-labelledby="groups-heading">
        <div className="border-b border-brand-border pb-3 mb-6">
          <h3 id="groups-heading" className="font-outfit text-lg font-extrabold text-brand-text uppercase tracking-wide">
            Fase de Grupos
          </h3>
          <p className="text-sm text-brand-text-secondary mt-0.5">
            Los dos mejores de cada grupo avanzan a Eliminatorias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {groupsList.map(letter => {
            const table = getGroupStandings(letter);
            return (
              <div key={letter} className="glass-card rounded-xl overflow-hidden flex flex-col">

                <div className="bg-brand-card-hover px-4 py-2 border-b border-brand-border flex items-center justify-between">
                  <span className="font-outfit text-sm font-black text-brand-text uppercase">
                    Grupo {letter}
                  </span>
                  <span className="text-xs text-brand-cyan font-semibold uppercase tracking-wider">
                    2026
                  </span>
                </div>

                <div className="p-3">
                  <table className="w-full text-left text-sm border-collapse" aria-label={`Grupo ${letter}`}>
                    <thead>
                      <tr className="text-xs font-bold text-brand-text-muted uppercase tracking-wide border-b border-brand-border">
                        <th scope="col" className="pb-1.5">Pos</th>
                        <th scope="col" className="pb-1.5">Equipo</th>
                        <th scope="col" className="pb-1.5 text-center">Pts</th>
                        <th scope="col" className="pb-1.5 text-center">PJ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {table.map((team, index) => {
                        const qualifies = index < 2;
                        return (
                          <tr key={team.id} className={qualifies ? "bg-brand-accent/5 font-semibold" : "opacity-70"}>
                            <td className="py-2 pl-1 font-mono text-xs">
                              {qualifies
                                ? <span className="font-bold text-brand-accent">{index + 1}°</span>
                                : <span className="text-brand-text-muted">{index + 1}°</span>
                              }
                            </td>
                            <td className="py-2 flex items-center gap-1.5 truncate max-w-[120px]">
                              <span className="text-base select-none" role="img" aria-label={team.name}>{team.flag}</span>
                              <span className={`truncate text-brand-text text-sm ${qualifies ? "font-extrabold" : ""}`}>{team.name}</span>
                            </td>
                            <td className="py-2 text-center font-outfit font-black text-brand-text text-sm">
                              {team.pts}
                            </td>
                            <td className="py-2 text-center font-mono text-xs text-brand-text-muted">
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
      </section>

      {/* Knockout bracket */}
      <section aria-labelledby="bracket-heading">
        <div className="border-b border-brand-border pb-3 mb-8">
          <h3 id="bracket-heading" className="font-outfit text-lg font-extrabold text-brand-text uppercase tracking-wide">
            Llave de Eliminatorias
          </h3>
          <p className="text-sm text-brand-text-secondary mt-0.5">
            Tu predicción de bracket. Desplázate horizontalmente para ver la llave completa.
          </p>
        </div>

        <div className="overflow-x-auto pb-6 select-none" tabIndex={0} aria-label="Llave de eliminatorias, desplázate horizontalmente">
          <div className="min-w-[960px] flex justify-between items-stretch py-4 px-2 gap-4">

            {/* Octavos izquierda */}
            <div className="flex flex-col justify-around gap-6 py-2 shrink-0">
              <PhaseLabel label="Octavos" />
              {renderBracketMatch("oct-1", "Partido 1")}
              {renderBracketMatch("oct-2", "Partido 2")}
              {renderBracketMatch("oct-3", "Partido 3")}
              {renderBracketMatch("oct-4", "Partido 4")}
            </div>

            {/* Cuartos izquierda */}
            <div className="flex flex-col justify-around gap-12 py-8 shrink-0">
              <PhaseLabel label="Cuartos" />
              {renderBracketMatch("qtr-1", "Cuartos 1")}
              {renderBracketMatch("qtr-2", "Cuartos 2")}
            </div>

            {/* Semifinal izquierda */}
            <div className="flex flex-col justify-around py-12 shrink-0">
              <PhaseLabel label="Semifinal" />
              {renderBracketMatch("semi-1", "Semifinal 1")}
            </div>

            {/* Final y 3er puesto */}
            <div className="flex flex-col justify-center items-center gap-10 py-6 shrink-0 bg-brand-card-hover rounded-xl border border-brand-border p-6 min-w-[240px]">
              <div className="text-center flex flex-col items-center gap-1">
                <div className="p-3 bg-brand-gold/10 border border-brand-gold/25 rounded-full text-brand-gold" aria-hidden="true">
                  <Trophy size={36} />
                </div>
                <span className="text-sm font-outfit font-black tracking-widest text-brand-gold uppercase mt-2">
                  Campeón 2026
                </span>
              </div>

              {renderBracketMatch("final", "Gran Final")}

              <div className="w-full h-px bg-brand-border" aria-hidden="true"></div>

              {renderBracketMatch("third_place", "Tercer Puesto")}
            </div>

            {/* Semifinal derecha */}
            <div className="flex flex-col justify-around py-12 shrink-0">
              <PhaseLabel label="Semifinal" />
              {renderBracketMatch("semi-2", "Semifinal 2")}
            </div>

            {/* Cuartos derecha */}
            <div className="flex flex-col justify-around gap-12 py-8 shrink-0">
              <PhaseLabel label="Cuartos" />
              {renderBracketMatch("qtr-3", "Cuartos 3")}
              {renderBracketMatch("qtr-4", "Cuartos 4")}
            </div>

            {/* Octavos derecha */}
            <div className="flex flex-col justify-around gap-6 py-2 shrink-0">
              <PhaseLabel label="Octavos" />
              {renderBracketMatch("oct-5", "Partido 5")}
              {renderBracketMatch("oct-6", "Partido 6")}
              {renderBracketMatch("oct-7", "Partido 7")}
              {renderBracketMatch("oct-8", "Partido 8")}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
