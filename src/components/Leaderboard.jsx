import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Award, Trophy, Eye, CheckCircle2, XCircle, Search, HelpCircle, X } from "lucide-react";

export default function Leaderboard() {
  const { standings, allPredictions, matches, teams } = useStore();
  const [selectedUser, setSelectedUser] = useState(null);

  const handleInspectUser = (userId, username) => {
    const detailedPreds = allPredictions
      .filter(p => p.user_id === userId)
      .map(pred => {
        const match = matches.find(m => m.id === pred.match_id);
        if (!match) return null;
        return {
          id:      pred.id,
          match,
          teamA:   teams.find(t => t.id === match.teamAId),
          teamB:   teams.find(t => t.id === match.teamBId),
          scoreA:  pred.predicted_score_a,
          scoreB:  pred.predicted_score_b,
          isCorrect: pred.is_correct,
        };
      })
      .filter(Boolean);

    setSelectedUser({ username, predictions: detailedPreds });
  };

  const getPercentage = (correct, total) =>
    !total ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* === Ranking column === */}
      <div className="lg:col-span-2 space-y-6">

        {/* Podium Top 3 */}
        {standings.length > 0 && (
          <div className="grid grid-cols-3 gap-3 md:gap-4 select-none" role="list" aria-label="Top 3 jugadores">

            {/* 2nd place */}
            {standings[1] && (
              <button
                role="listitem"
                onClick={() => handleInspectUser(standings[1].user_id, standings[1].username)}
                aria-label={`Ver predicciones de ${standings[1].username}, 2do lugar con ${standings[1].correct_predictions} puntos`}
                className="glass-card mt-6 p-4 rounded-xl text-center hover:border-brand-silver/50 cursor-pointer flex flex-col justify-end items-center relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-silver/50 w-full"
              >
                <div className="absolute top-0 right-0 p-1.5 bg-brand-silver/10 text-brand-silver font-black text-xs font-outfit rounded-bl-lg" aria-hidden="true">2°</div>
                <div className="p-2.5 bg-brand-silver/10 border border-brand-silver/20 rounded-full text-brand-silver mb-2" aria-hidden="true">
                  <Award size={22} />
                </div>
                <span className="font-outfit text-sm font-extrabold text-brand-text truncate max-w-full">{standings[1].username}</span>
                <span className="text-xl font-black text-brand-silver font-outfit mt-1">{standings[1].correct_predictions} pts</span>
                <span className="text-xs text-brand-text-muted font-bold uppercase">{getPercentage(standings[1].correct_predictions, standings[1].total_matches)}% acierto</span>
              </button>
            )}

            {/* 1st place */}
            {standings[0] && (
              <button
                role="listitem"
                onClick={() => handleInspectUser(standings[0].user_id, standings[0].username)}
                aria-label={`Ver predicciones de ${standings[0].username}, 1er lugar con ${standings[0].correct_predictions} puntos`}
                className="glass-card p-5 rounded-xl border-brand-gold/30 text-center hover:border-brand-gold/60 cursor-pointer flex flex-col justify-end items-center relative overflow-hidden scale-105 z-10 bg-brand-gold/5 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 w-full"
              >
                <div className="absolute top-0 right-0 p-1.5 bg-brand-gold/15 text-brand-gold font-black text-sm font-outfit rounded-bl-lg" aria-hidden="true">1°</div>
                <div className="p-3.5 bg-brand-gold/10 border border-brand-gold/25 rounded-full text-brand-gold mb-3" aria-hidden="true">
                  <Trophy size={30} />
                </div>
                <span className="font-outfit text-base font-extrabold text-brand-text truncate max-w-full">{standings[0].username}</span>
                <span className="text-2xl font-black text-brand-gold font-outfit mt-1">{standings[0].correct_predictions} pts</span>
                <span className="text-xs text-brand-gold/80 font-extrabold uppercase">{getPercentage(standings[0].correct_predictions, standings[0].total_matches)}% acierto</span>
              </button>
            )}

            {/* 3rd place */}
            {standings[2] && (
              <button
                role="listitem"
                onClick={() => handleInspectUser(standings[2].user_id, standings[2].username)}
                aria-label={`Ver predicciones de ${standings[2].username}, 3er lugar con ${standings[2].correct_predictions} puntos`}
                className="glass-card mt-8 p-4 rounded-xl border-brand-bronze/20 text-center hover:border-brand-bronze/50 cursor-pointer flex flex-col justify-end items-center relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-bronze/50 w-full"
              >
                <div className="absolute top-0 right-0 p-1.5 bg-brand-bronze/10 text-brand-bronze font-black text-xs font-outfit rounded-bl-lg" aria-hidden="true">3°</div>
                <div className="p-2.5 bg-brand-bronze/10 border border-brand-bronze/20 rounded-full text-brand-bronze mb-2" aria-hidden="true">
                  <Award size={18} />
                </div>
                <span className="font-outfit text-sm font-extrabold text-brand-text truncate max-w-full">{standings[2].username}</span>
                <span className="text-xl font-black text-brand-bronze font-outfit mt-1">{standings[2].correct_predictions} pts</span>
                <span className="text-xs text-brand-text-muted font-bold uppercase">{getPercentage(standings[2].correct_predictions, standings[2].total_matches)}% acierto</span>
              </button>
            )}

          </div>
        )}

        {/* Full standings table */}
        <div className="glass-card rounded-xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 bg-brand-card-hover border-b border-brand-border flex items-center justify-between">
            <h3 className="font-outfit text-base font-extrabold text-brand-text uppercase tracking-wide">
              Tabla de Clasificación
            </h3>
            <span className="text-sm text-brand-text-muted font-medium">
              {standings.length} {standings.length === 1 ? "jugador" : "jugadores"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg text-xs font-bold text-brand-text-secondary uppercase tracking-wider border-b border-brand-border">
                  <th scope="col" className="px-6 py-3.5 text-center w-16">Pos</th>
                  <th scope="col" className="px-6 py-3.5">Usuario</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Pred.</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Aciertos</th>
                  <th scope="col" className="px-6 py-3.5 text-center">%</th>
                  <th scope="col" className="px-6 py-3.5 text-center w-24">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {standings.map((user, index) => {
                  let medalColor = "text-brand-text-muted";
                  if (index === 0) medalColor = "text-brand-gold";
                  if (index === 1) medalColor = "text-brand-silver";
                  if (index === 2) medalColor = "text-brand-bronze";

                  return (
                    <tr key={user.id} className="hover:bg-brand-card-hover transition-colors">
                      <td className="px-6 py-4 text-center font-outfit font-black text-sm text-brand-text-secondary">
                        {index < 3 ? (
                          <Trophy size={16} className={medalColor} aria-label={`${index + 1}er lugar`} />
                        ) : (
                          <span aria-label={`Posición ${index + 1}`}>{index + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-outfit text-sm font-extrabold text-brand-text">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-sm text-brand-text-secondary">
                        {user.total_matches}
                      </td>
                      <td className="px-6 py-4 text-center font-outfit font-black text-base text-brand-cyan">
                        {user.correct_predictions}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 bg-brand-card-hover border border-brand-border rounded font-mono text-xs text-brand-text-secondary">
                          {getPercentage(user.correct_predictions, user.total_matches)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleInspectUser(user.user_id, user.username)}
                          aria-label={`Ver predicciones de ${user.username}`}
                          className="flex items-center justify-center min-w-[44px] min-h-[44px] mx-auto bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-slate-900 border border-brand-cyan/30 hover:border-brand-cyan rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
                        >
                          <Eye size={14} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {standings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-sm text-brand-text-muted italic">
                      No hay competidores registrados en esta polla todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* === Predictions sidebar === */}
      <aside className="lg:col-span-1" aria-label="Predicciones del jugador seleccionado">
        {selectedUser ? (
          <div className="glass-card rounded-xl overflow-hidden shadow-lg sticky top-24 max-h-[80vh] flex flex-col">

            <div className="px-5 py-4 bg-brand-card-hover border-b border-brand-border flex items-center justify-between">
              <div>
                <h4 className="font-outfit text-sm font-extrabold text-brand-cyan uppercase tracking-wide">
                  {selectedUser.username}
                </h4>
                <span className="text-xs text-brand-text-muted">
                  {selectedUser.predictions.length} pronósticos
                </span>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                aria-label={`Cerrar panel de predicciones de ${selectedUser.username}`}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] bg-brand-card-hover hover:bg-brand-border rounded-lg text-brand-text-secondary hover:text-brand-text cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-border"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {selectedUser.predictions.map(pred => {
                const finished = pred.match.status === "finished";
                let cardBorder  = "border-brand-border bg-brand-bg";
                let statusIcon  = null;

                if (finished) {
                  if (pred.isCorrect) {
                    cardBorder = "border-brand-accent/30 bg-brand-accent/5";
                    statusIcon = <CheckCircle2 size={13} className="text-brand-accent" aria-hidden="true" />;
                  } else {
                    cardBorder = "border-brand-crimson/20 bg-brand-crimson/5";
                    statusIcon = <XCircle size={13} className="text-brand-crimson" aria-hidden="true" />;
                  }
                } else {
                  statusIcon = <HelpCircle size={13} className="text-brand-text-muted" aria-hidden="true" />;
                }

                return (
                  <div key={pred.id} className={`p-3 rounded-lg border ${cardBorder} flex flex-col gap-2`}>
                    <div className="flex items-center justify-between text-xs text-brand-text-muted font-bold uppercase tracking-wider">
                      <span>{pred.match.stage === "groups" ? `Grupo ${pred.match.groupLetter}` : pred.match.stage.toUpperCase()}</span>
                      <div className="flex items-center gap-1">
                        {statusIcon}
                        <span>{finished ? (pred.isCorrect ? "Correcto" : "Incorrecto") : "Pendiente"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm font-semibold text-brand-text">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-lg select-none" role="img" aria-label={pred.teamA?.name || "Equipo A"}>{pred.teamA?.flag || "🏳️"}</span>
                        <span className="truncate">{pred.teamA?.name || pred.match.teamAPlaceholder}</span>
                      </div>

                      <div className="flex flex-col items-center justify-center px-3 text-center shrink-0">
                        <div className="font-mono text-xs text-brand-text-secondary">
                          Pred: <span className="font-outfit font-black text-brand-cyan">{pred.scoreA}–{pred.scoreB}</span>
                        </div>
                        {finished && (
                          <div className="font-mono text-xs text-brand-text-muted">
                            Real: <span className="font-bold">{pred.match.finalScoreA}–{pred.match.finalScoreB}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end text-right">
                        <span className="truncate">{pred.teamB?.name || pred.match.teamBPlaceholder}</span>
                        <span className="text-lg select-none" role="img" aria-label={pred.teamB?.name || "Equipo B"}>{pred.teamB?.flag || "🏳️"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {selectedUser.predictions.length === 0 && (
                <div className="text-center py-10 text-sm text-brand-text-muted italic">
                  Este jugador no ha guardado predicciones todavía.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="glass-card rounded-xl p-8 text-center text-brand-text-muted flex flex-col items-center justify-center min-h-[300px]">
            <Search size={28} className="text-brand-border mb-3" aria-hidden="true" />
            <h4 className="font-outfit text-sm font-extrabold text-brand-text-secondary uppercase tracking-wide mb-1">
              Visualizar Predicciones
            </h4>
            <p className="text-sm">
              Haz clic en el ícono de ojo o en la tarjeta del podio de cualquier jugador.
            </p>
          </div>
        )}
      </aside>

    </div>
  );
}
