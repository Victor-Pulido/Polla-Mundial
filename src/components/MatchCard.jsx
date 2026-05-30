import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Clock, Lock, CheckCircle2, XCircle, HelpCircle, Save, Edit2, Play } from "lucide-react";

export default React.memo(function MatchCard({ match, userPrediction, onSimulateResult }) {
  const { savePrediction, isDemoMode } = useStore();
  const [scoreA, setScoreA]           = useState(userPrediction ? userPrediction.scoreA : "");
  const [scoreB, setScoreB]           = useState(userPrediction ? userPrediction.scoreB : "");
  const [isEditing, setIsEditing]     = useState(!userPrediction);
  const [isSaving, setIsSaving]       = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLocked, setIsLocked]       = useState(false);

  const [adminSimOpen, setAdminSimOpen] = useState(false);
  const [simScoreA, setSimScoreA]       = useState("");
  const [simScoreB, setSimScoreB]       = useState("");

  const { id, matchDate, stage, groupLetter, stadium, status, finalScoreA, finalScoreB, teamAId, teamBId } = match;
  const teams = useStore(state => state.teams);

  const teamA = teams.find(t => t.id === teamAId);
  const teamB = teams.find(t => t.id === teamBId);

  const formattedDate = new Date(matchDate).toLocaleString("es-ES", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const cutoff = new Date(matchDate).getTime() - 15 * 60 * 1000;
      const now    = Date.now();
      if (now > cutoff) {
        setIsLocked(true);
        setIsEditing(false);
        setTimeRemaining("Cerrado");
      } else {
        const diff  = cutoff - now;
        const hours = Math.floor(diff / 3600000);
        const mins  = Math.floor((diff % 3600000) / 60000);
        setTimeRemaining(hours > 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${mins}m`);
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [matchDate]);

  useEffect(() => {
    if (userPrediction) {
      setScoreA(userPrediction.scoreA);
      setScoreB(userPrediction.scoreB);
      setIsEditing(false);
    } else {
      setScoreA("");
      setScoreB("");
      setIsEditing(!isLocked);
    }
  }, [userPrediction, isLocked]);

  const handleSave = async () => {
    if (scoreA === "" || scoreB === "") return;
    setIsSaving(true);
    const ok = await savePrediction(id, scoreA, scoreB);
    if (ok) setIsEditing(false);
    setIsSaving(false);
  };

  const handleSimulate = async () => {
    if (simScoreA === "" || simScoreB === "") return;
    if (onSimulateResult) {
      await onSimulateResult(id, simScoreA, simScoreB);
      setAdminSimOpen(false);
    }
  };

  /* Border and status badge */
  let borderClass  = "border-brand-border hover:border-brand-border-active";
  let statusBadge  = null;

  if (status === "finished") {
    if (userPrediction?.isCorrect) {
      borderClass = "border-brand-accent/50 bg-brand-accent/5";
      statusBadge = (
        <div className="flex items-center gap-1 text-xs font-bold text-brand-accent uppercase tracking-wide bg-brand-accent/10 border border-brand-accent/25 px-2 py-0.5 rounded">
          <CheckCircle2 size={11} aria-hidden="true" />
          Acierto (+1)
        </div>
      );
    } else if (userPrediction) {
      borderClass = "border-brand-crimson/40 bg-brand-crimson/5";
      statusBadge = (
        <div className="flex items-center gap-1 text-xs font-bold text-brand-crimson uppercase tracking-wide bg-brand-crimson/10 border border-brand-crimson/20 px-2 py-0.5 rounded">
          <XCircle size={11} aria-hidden="true" />
          Fallo (0)
        </div>
      );
    } else {
      borderClass = "border-brand-border opacity-70";
      statusBadge = (
        <div className="flex items-center gap-1 text-xs font-bold text-brand-text-muted uppercase tracking-wide bg-brand-card-hover border border-brand-border px-2 py-0.5 rounded">
          <HelpCircle size={11} aria-hidden="true" />
          Sin Predicción
        </div>
      );
    }
  } else if (isLocked) {
    borderClass = "border-brand-border/50 opacity-70";
    statusBadge = (
      <div className="flex items-center gap-1 text-xs font-bold text-brand-text-muted uppercase tracking-wide bg-brand-card-hover px-2 py-0.5 rounded">
        <Lock size={10} aria-hidden="true" />
        Bloqueado
      </div>
    );
  } else {
    statusBadge = (
      <div className="flex items-center gap-1 text-xs font-semibold text-brand-cyan uppercase tracking-wide bg-brand-cyan/10 px-2 py-0.5 rounded" aria-live="polite">
        <Clock size={10} aria-hidden="true" />
        {timeRemaining ? `Cierra en: ${timeRemaining}` : "Calculando..."}
      </div>
    );
  }

  const stageLabel = stage === "groups" ? `Grupo ${groupLetter}` : stage.toUpperCase();

  return (
    <article className={`relative glass-card rounded-xl border ${borderClass} p-4 flex flex-col justify-between h-full`} aria-label={`Partido: ${teamA?.name || match.teamAPlaceholder} vs ${teamB?.name || match.teamBPlaceholder}`}>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border pb-2.5 mb-3 text-xs text-brand-text-secondary">
        <span className="font-semibold uppercase tracking-wide">{stageLabel}</span>
        {statusBadge}
      </div>

      {/* Teams and score */}
      <div className="flex items-center justify-between my-3 gap-2">

        <div className="flex flex-col items-center flex-1 text-center">
          {teamA ? (
            <>
              <span className="text-3xl mb-1.5 select-none" role="img" aria-label={teamA.name}>{teamA.flag}</span>
              <span className="font-outfit text-sm font-extrabold text-brand-text line-clamp-1">{teamA.name}</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-brand-card-hover border border-brand-border flex items-center justify-center text-xs font-mono text-brand-text-muted mb-1.5" aria-hidden="true">?</div>
              <span className="font-outfit text-sm font-bold text-brand-text-muted">{match.teamAPlaceholder}</span>
            </>
          )}
        </div>

        <div className="flex flex-col items-center justify-center px-2">
          {status === "finished" ? (
            <div className="font-outfit text-2xl font-black text-brand-gold tracking-tight bg-brand-bg border border-brand-border px-3 py-1 rounded-lg" aria-label={`Resultado: ${finalScoreA} a ${finalScoreB}`}>
              {finalScoreA} – {finalScoreB}
            </div>
          ) : status === "live" ? (
            <div className="font-outfit text-lg font-bold text-brand-crimson tracking-tight bg-brand-crimson/10 border border-brand-crimson/30 px-3 py-0.5 rounded-lg" role="status" aria-label="Partido en vivo">
              EN VIVO
            </div>
          ) : (
            <div className="text-xs font-mono text-brand-text-muted bg-brand-card-hover px-2 py-0.5 rounded border border-brand-border select-none" aria-hidden="true">
              VS
            </div>
          )}
          <span className="text-xs text-brand-text-muted mt-1.5 text-center font-medium line-clamp-1 max-w-[100px]">
            {stadium.split(" (")[0]}
          </span>
        </div>

        <div className="flex flex-col items-center flex-1 text-center">
          {teamB ? (
            <>
              <span className="text-3xl mb-1.5 select-none" role="img" aria-label={teamB.name}>{teamB.flag}</span>
              <span className="font-outfit text-sm font-extrabold text-brand-text line-clamp-1">{teamB.name}</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-brand-card-hover border border-brand-border flex items-center justify-center text-xs font-mono text-brand-text-muted mb-1.5" aria-hidden="true">?</div>
              <span className="font-outfit text-sm font-bold text-brand-text-muted">{match.teamBPlaceholder}</span>
            </>
          )}
        </div>

      </div>

      {/* Prediction section */}
      <div className="border-t border-brand-border pt-3 mt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-text-secondary uppercase tracking-wide">
            Mi Predicción:
          </span>

          {!isEditing && userPrediction && (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 font-outfit text-sm font-black text-brand-text bg-brand-bg border border-brand-border px-3 py-1 rounded-lg"
                aria-label={`Predicción guardada: ${scoreA} a ${scoreB}`}
              >
                <span className="text-brand-cyan">{scoreA}</span>
                <span className="text-brand-text-muted font-normal">–</span>
                <span className="text-brand-cyan">{scoreB}</span>
              </div>

              {!isLocked && status !== "finished" && (
                <button
                  onClick={() => setIsEditing(true)}
                  aria-label="Editar predicción"
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] bg-brand-card-hover border border-brand-border hover:border-brand-border-active rounded-lg text-brand-text-secondary hover:text-brand-cyan cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
                >
                  <Edit2 size={13} aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {isLocked && !userPrediction && (
            <span className="text-xs font-semibold text-brand-text-muted italic">
              Sin pronóstico
            </span>
          )}

          {isEditing && !isLocked && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1" role="group" aria-label="Ingresar predicción de marcador">
                <input
                  type="number"
                  min="0"
                  max="99"
                  disabled={!teamA || !teamB}
                  value={scoreA}
                  onChange={e => setScoreA(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                  aria-label={`Goles de ${teamA?.name || "equipo local"}`}
                  className="w-11 h-11 text-center bg-brand-bg border border-brand-border focus:border-brand-border-active text-brand-text font-outfit font-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-brand-text-muted font-bold" aria-hidden="true">–</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  disabled={!teamA || !teamB}
                  value={scoreB}
                  onChange={e => setScoreB(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                  aria-label={`Goles de ${teamB?.name || "equipo visitante"}`}
                  className="w-11 h-11 text-center bg-brand-bg border border-brand-border focus:border-brand-border-active text-brand-text font-outfit font-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={scoreA === "" || scoreB === "" || isSaving || !teamA || !teamB}
                aria-label="Guardar predicción"
                className="flex items-center justify-center min-w-[44px] min-h-[44px] bg-brand-cyan hover:bg-brand-border-active disabled:opacity-30 text-slate-900 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-brand-card"
              >
                <Save size={15} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Admin simulation panel (demo mode only) */}
        {isDemoMode && status !== "finished" && (
          <div className="mt-3 pt-2.5 border-t border-dashed border-brand-border flex flex-col gap-2">
            {!adminSimOpen ? (
              <button
                onClick={() => setAdminSimOpen(true)}
                className="w-full py-2 border border-dashed border-brand-border hover:border-brand-cyan/50 bg-brand-card-hover text-brand-cyan hover:text-brand-text rounded-lg text-xs font-bold tracking-wide uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play size={10} aria-hidden="true" />
                Simular Partido (Admin)
              </button>
            ) : (
              <div className="bg-brand-bg p-2.5 rounded-lg border border-brand-border flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-brand-text-secondary uppercase">
                  <span>Resultado del Partido</span>
                  <button
                    onClick={() => setAdminSimOpen(false)}
                    aria-label="Cancelar simulación"
                    className="text-brand-crimson hover:underline cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  <span className="text-xs text-brand-text-secondary font-semibold truncate max-w-[80px]">{teamA?.name || "Local"}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={simScoreA}
                    onChange={e => setSimScoreA(e.target.value)}
                    aria-label={`Goles simulados de ${teamA?.name || "local"}`}
                    className="w-11 h-10 text-center bg-brand-card border border-brand-border text-brand-text text-sm font-bold rounded focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
                  />
                  <span className="text-brand-text-muted font-bold" aria-hidden="true">–</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={simScoreB}
                    onChange={e => setSimScoreB(e.target.value)}
                    aria-label={`Goles simulados de ${teamB?.name || "visitante"}`}
                    className="w-11 h-10 text-center bg-brand-card border border-brand-border text-brand-text text-sm font-bold rounded focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
                  />
                  <span className="text-xs text-brand-text-secondary font-semibold truncate max-w-[80px]">{teamB?.name || "Visitante"}</span>
                  <button
                    onClick={handleSimulate}
                    disabled={simScoreA === "" || simScoreB === ""}
                    className="py-2 px-3 bg-brand-cyan text-slate-900 text-xs font-black uppercase rounded hover:bg-brand-border-active cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer: date and stadium */}
      <div className="text-xs text-brand-text-muted mt-2 flex justify-between items-center select-none">
        <time dateTime={matchDate}>{formattedDate}</time>
        <span className="truncate max-w-[120px] text-right">{stadium.split(" (")[1]?.replace(")", "") || stadium}</span>
      </div>

    </article>
  );
});
