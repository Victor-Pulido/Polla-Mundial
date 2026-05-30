import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Award, Trophy, Eye, CheckCircle2, XCircle, Search, HelpCircle, X } from "lucide-react";

export default function Leaderboard() {
  const { standings, allPredictions, matches, teams } = useStore();
  const [selectedUser, setSelectedUser] = useState(null);

  // Obtener predicciones detalladas del usuario seleccionado
  const handleInspectUser = (userId, username) => {
    const userPreds = allPredictions.filter(p => p.user_id === userId);
    
    // Mapear predicciones con detalles del partido
    const detailedPreds = userPreds.map(pred => {
      const match = matches.find(m => m.id === pred.match_id);
      if (!match) return null;

      const teamA = teams.find(t => t.id === match.teamAId);
      const teamB = teams.find(t => t.id === match.teamBId);

      return {
        id: pred.id,
        match,
        teamA,
        teamB,
        scoreA: pred.predicted_score_a,
        scoreB: pred.predicted_score_b,
        isCorrect: pred.is_correct
      };
    }).filter(Boolean);

    setSelectedUser({ username, predictions: detailedPreds });
  };

  const getPercentage = (correct, total) => {
    if (!total || total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Columna del Ranking */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Podio Visual Top 3 */}
        {standings.length > 0 && (
          <div className="grid grid-cols-3 gap-3 md:gap-4 select-none">
            
            {/* 2do Lugar (Izquierda) */}
            {standings[1] && (
              <div
                onClick={() => handleInspectUser(standings[1].user_id, standings[1].username)}
                className="glass-card mt-6 p-4 rounded-2xl border border-brand-silver/20 text-center hover:border-brand-silver/50 cursor-pointer flex flex-col justify-end items-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-1.5 bg-brand-silver/10 text-brand-silver font-black text-xs font-outfit rounded-bl-xl border-l border-b border-brand-silver/20">2ND</div>
                <div className="p-3 bg-brand-silver/10 border border-brand-silver/20 rounded-full text-brand-silver mb-2">
                  <Award size={24} />
                </div>
                <span className="font-outfit text-sm font-extrabold text-white truncate max-w-full">{standings[1].username}</span>
                <span className="text-xl font-black text-brand-silver font-outfit mt-1">{standings[1].correct_predictions} pts</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">{getPercentage(standings[1].correct_predictions, standings[1].total_matches)}% acierto</span>
              </div>
            )}

            {/* 1er Lugar (Centro - Más Alto) */}
            {standings[0] && (
              <div
                onClick={() => handleInspectUser(standings[0].user_id, standings[0].username)}
                className="glass-card p-5 rounded-2xl border border-brand-gold/25 text-center hover:border-brand-gold/60 cursor-pointer flex flex-col justify-end items-center relative overflow-hidden neon-glow-gold scale-105 z-10 bg-gradient-to-b from-[#121A2D] to-[#1F201C]"
              >
                <div className="absolute top-0 right-0 p-1.5 bg-brand-gold/15 text-brand-gold font-black text-sm font-outfit rounded-bl-xl border-l border-b border-brand-gold/20">1ST</div>
                <div className="p-4 bg-brand-gold/10 border border-brand-gold/25 rounded-full text-brand-gold mb-3 animate-float">
                  <Trophy size={32} />
                </div>
                <span className="font-outfit text-base font-extrabold text-white truncate max-w-full">{standings[0].username}</span>
                <span className="text-2xl font-black text-brand-gold font-outfit mt-1">{standings[0].correct_predictions} pts</span>
                <span className="text-xs text-brand-gold/70 font-extrabold uppercase">{getPercentage(standings[0].correct_predictions, standings[0].total_matches)}% acierto</span>
              </div>
            )}

            {/* 3er Lugar (Derecha) */}
            {standings[2] && (
              <div
                onClick={() => handleInspectUser(standings[2].user_id, standings[2].username)}
                className="glass-card mt-8 p-4 rounded-2xl border border-brand-bronze/20 text-center hover:border-brand-bronze/50 cursor-pointer flex flex-col justify-end items-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-1.5 bg-brand-bronze/10 text-brand-bronze font-black text-xs font-outfit rounded-bl-xl border-l border-b border-brand-bronze/20">3RD</div>
                <div className="p-2.5 bg-brand-bronze/10 border border-brand-bronze/20 rounded-full text-brand-bronze mb-2">
                  <Award size={20} />
                </div>
                <span className="font-outfit text-sm font-extrabold text-white truncate max-w-full">{standings[2].username}</span>
                <span className="text-xl font-black text-brand-bronze font-outfit mt-1">{standings[2].correct_predictions} pts</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">{getPercentage(standings[2].correct_predictions, standings[2].total_matches)}% acierto</span>
              </div>
            )}

          </div>
        )}

        {/* Tabla Completa de Clasificación */}
        <div className="glass-card rounded-2xl border border-brand-border/40 overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-outfit text-base font-extrabold text-white uppercase tracking-wider">
              Tabla de Clasificación
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              {standings.length} Jugadores Totales
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-3.5 text-center w-16">Pos</th>
                  <th className="px-6 py-3.5">Usuario</th>
                  <th className="px-6 py-3.5 text-center">Predicciones</th>
                  <th className="px-6 py-3.5 text-center">Aciertos</th>
                  <th className="px-6 py-3.5 text-center">Acierto (%)</th>
                  <th className="px-6 py-3.5 text-center w-24">Inspeccionar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {standings.map((user, index) => {
                  const isTop3 = index < 3;
                  const rowClass = isTop3 
                    ? "bg-slate-900/10 hover:bg-slate-900/30" 
                    : "hover:bg-slate-900/20";
                  
                  let medalColor = "text-gray-500";
                  if (index === 0) medalColor = "text-brand-gold";
                  if (index === 1) medalColor = "text-brand-silver";
                  if (index === 2) medalColor = "text-brand-bronze";

                  return (
                    <tr key={user.id} className={`${rowClass} transition-all`}>
                      {/* Posición */}
                      <td className="px-6 py-4 text-center font-outfit font-black text-base text-gray-400">
                        {isTop3 ? (
                          <div className={`inline-flex items-center justify-center ${medalColor}`}>
                            <Trophy size={18} />
                          </div>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </td>
                      
                      {/* Nombre */}
                      <td className="px-6 py-4 font-outfit text-sm font-extrabold text-white">
                        {user.username}
                      </td>

                      {/* Total predicciones */}
                      <td className="px-6 py-4 text-center font-mono text-sm text-gray-400">
                        {user.total_matches}
                      </td>

                      {/* Aciertos */}
                      <td className="px-6 py-4 text-center font-outfit font-black text-base text-brand-cyan">
                        {user.correct_predictions}
                      </td>

                      {/* Porcentaje */}
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-xs text-gray-300">
                          {getPercentage(user.correct_predictions, user.total_matches)}%
                        </span>
                      </td>

                      {/* Acción Inspeccionar */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleInspectUser(user.user_id, user.username)}
                          className="p-1.5 bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-black border border-brand-cyan/35 hover:border-brand-cyan rounded-lg transition-all cursor-pointer"
                          title={`Ver predicciones de ${user.username}`}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {standings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-xs text-gray-500 italic">
                      No hay competidores registrados en esta polla todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Columna lateral: Visualizador de Predicciones del Usuario Seleccionado */}
      <div className="lg:col-span-1">
        {selectedUser ? (
          <div className="glass-card rounded-2xl border border-brand-cyan/30 bg-gradient-to-b from-[#121A2D] to-[#0B0F19] overflow-hidden shadow-xl sticky top-24 max-h-[80vh] flex flex-col animate-float">
            
            {/* Cabecera del Panel */}
            <div className="px-5 py-4 bg-brand-cyan/5 border-b border-brand-cyan/10 flex items-center justify-between">
              <div>
                <h4 className="font-outfit text-sm font-extrabold text-brand-cyan uppercase tracking-wider">
                  Predicciones de {selectedUser.username}
                </h4>
                <span className="text-[10px] text-gray-500">
                  {selectedUser.predictions.length} Pronósticos Realizados
                </span>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Listado de Predicciones */}
            <div className="p-4 overflow-y-auto space-y-3 shrink flex-1">
              {selectedUser.predictions.map((pred) => {
                const matchFinished = pred.match.status === "finished";
                
                let cardBorder = "border-white/5 bg-slate-900/40";
                let statusIcon = null;

                if (matchFinished) {
                  if (pred.isCorrect) {
                    cardBorder = "border-brand-accent/30 bg-brand-accent/5";
                    statusIcon = <CheckCircle2 size={14} className="text-brand-accent" />;
                  } else {
                    cardBorder = "border-brand-crimson/20 bg-brand-crimson/5";
                    statusIcon = <XCircle size={14} className="text-brand-crimson" />;
                  }
                } else {
                  statusIcon = <HelpCircle size={14} className="text-gray-500" />;
                }

                return (
                  <div key={pred.id} className={`p-3 rounded-xl border ${cardBorder} flex flex-col gap-2`}>
                    
                    {/* Detalles del partido */}
                    <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                      <span>{pred.match.stage === "groups" ? `Grupo ${pred.match.groupLetter}` : pred.match.stage.toUpperCase()}</span>
                      <div className="flex items-center gap-1">
                        {statusIcon}
                        <span>{matchFinished ? (pred.isCorrect ? "Correcto" : "Incorrecto") : "Pendiente"}</span>
                      </div>
                    </div>

                    {/* Equipos y Marcador */}
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      
                      {/* Team A */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-lg select-none">{pred.teamA?.flag || "🏳️"}</span>
                        <span className="truncate">{pred.teamA?.name || pred.match.teamAPlaceholder}</span>
                      </div>

                      {/* Scores y Predicción */}
                      <div className="flex flex-col items-center justify-center px-3 text-center shrink-0">
                        <div className="font-mono text-[10px] text-gray-400">Pred: <span className="font-outfit font-black text-brand-cyan">{pred.scoreA} - {pred.scoreB}</span></div>
                        {matchFinished && (
                          <div className="font-mono text-[9px] text-gray-600">Real: <span className="font-bold">{pred.match.finalScoreA} - {pred.match.finalScoreB}</span></div>
                        )}
                      </div>

                      {/* Team B */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end text-right">
                        <span className="truncate">{pred.teamB?.name || pred.match.teamBPlaceholder}</span>
                        <span className="text-lg select-none">{pred.teamB?.flag || "🏳️"}</span>
                      </div>

                    </div>

                  </div>
                );
              })}

              {selectedUser.predictions.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-500 italic">
                  Este jugador no ha guardado predicciones todavía.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-brand-border/40 p-8 text-center text-gray-500 italic flex flex-col items-center justify-center min-h-[300px] shadow-xl">
            <Search size={32} className="text-brand-border animate-pulse mb-3" />
            <h4 className="font-outfit text-sm font-extrabold text-gray-400 uppercase tracking-wider not-italic mb-1">
              Visualizar Predicciones
            </h4>
            <p className="text-xs">
              Haz clic en el ícono de <span className="font-semibold text-brand-cyan">Ojo</span> o en la tarjeta del podio de cualquier jugador para inspeccionar todos sus pronósticos.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
