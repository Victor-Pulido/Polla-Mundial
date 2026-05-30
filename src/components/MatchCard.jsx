import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Clock, Lock, CheckCircle2, XCircle, HelpCircle, Save, Edit2, Play } from "lucide-react";

export default React.memo(function MatchCard({ match, userPrediction, onSimulateResult }) {
  const { savePrediction, isDemoMode } = useStore();
  const [scoreA, setScoreA] = useState(userPrediction ? userPrediction.scoreA : "");
  const [scoreB, setScoreB] = useState(userPrediction ? userPrediction.scoreB : "");
  
  const [isEditing, setIsEditing] = useState(!userPrediction);
  const [isSaving, setIsSaving] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  // Panel Admin de simulación
  const [adminSimOpen, setAdminSimOpen] = useState(false);
  const [simScoreA, setSimScoreA] = useState("");
  const [simScoreB, setSimScoreB] = useState("");

  const { id, matchDate, stage, groupLetter, stadium, status, finalScoreA, finalScoreB, teamAId, teamBId } = match;
  const teams = useStore(state => state.teams);

  const teamA = teams.find(t => t.id === teamAId);
  const teamB = teams.find(t => t.id === teamBId);

  // Formatear Fecha
  const formattedDate = new Date(matchDate).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  // Calcular tiempo restante y estado de bloqueo
  useEffect(() => {
    const calculateTime = () => {
      const matchTime = new Date(matchDate).getTime();
      const cutoffTime = matchTime - 15 * 60 * 1000; // 15 min antes
      const now = Date.now();

      if (now > cutoffTime) {
        setIsLocked(true);
        setIsEditing(false);
        setTimeRemaining("🔒 Cerrado");
      } else {
        const diff = cutoffTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setTimeRemaining(`Cierra en: ${days}d ${hours % 24}h`);
        } else {
          setTimeRemaining(`Cierra en: ${hours}h ${mins}m`);
        }
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [matchDate]);

  // Sincronizar estado cuando cambie la predicción externamente (por re-renders o recargas)
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
    const success = await savePrediction(id, scoreA, scoreB);
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleSimulate = async () => {
    if (simScoreA === "" || simScoreB === "") return;
    if (onSimulateResult) {
      await onSimulateResult(id, simScoreA, simScoreB);
      setAdminSimOpen(false);
    }
  };

  // Determinar clases de colores del borde e íconos de aciertos
  let borderClass = "border-brand-border/40 hover:border-brand-border/80";
  let statusBadge = null;

  if (status === "finished") {
    if (userPrediction) {
      const isCorrect = userPrediction.isCorrect;
      if (isCorrect) {
        borderClass = "border-brand-accent/50 bg-gradient-to-b from-[#121A2D] to-[#0A261D] neon-glow-green";
        statusBadge = (
          <div className="flex items-center gap-1 text-[10px] font-bold text-brand-accent uppercase tracking-wider bg-brand-accent/10 border border-brand-accent/25 px-2 py-0.5 rounded-md animate-pulse">
            <CheckCircle2 size={12} />
            Acierto (+1)
          </div>
        );
      } else {
        borderClass = "border-brand-crimson/40 bg-gradient-to-b from-[#121A2D] to-[#251318]";
        statusBadge = (
          <div className="flex items-center gap-1 text-[10px] font-bold text-brand-crimson uppercase tracking-wider bg-brand-crimson/10 border border-brand-crimson/20 px-2 py-0.5 rounded-md">
            <XCircle size={12} />
            Fallo (0)
          </div>
        );
      }
    } else {
      borderClass = "border-white/10 opacity-70";
      statusBadge = (
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
          <HelpCircle size={12} />
          Sin Predicción
        </div>
      );
    }
  } else if (isLocked) {
    borderClass = "border-brand-border/20 bg-slate-950/20";
    statusBadge = (
      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
        <Lock size={10} />
        Bloqueado
      </div>
    );
  } else {
    statusBadge = (
      <div className="flex items-center gap-1 text-[10px] font-semibold text-brand-cyan uppercase tracking-wider bg-brand-cyan/10 px-2 py-0.5 rounded-md">
        <Clock size={10} className="animate-pulse" />
        {timeRemaining}
      </div>
    );
  }

  return (
    <div className={`relative glass-card rounded-2xl border ${borderClass} p-4 transition-all duration-300 flex flex-col justify-between h-full`}>
      
      {/* Encabezado de la Tarjeta */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 text-xs text-gray-400">
        <span className="font-semibold uppercase tracking-wider">
          {stage === "groups" ? `Grupo ${groupLetter}` : stage.toUpperCase()}
        </span>
        {statusBadge}
      </div>

      {/* Cuerpo del Partido (Banderas y Marcador) */}
      <div className="flex items-center justify-between my-3 gap-2">
        
        {/* Equipo A */}
        <div className="flex flex-col items-center flex-1 text-center">
          {teamA ? (
            <>
              <span className="text-3xl md:text-4xl mb-1.5 filter drop-shadow-md select-none">{teamA.flag}</span>
              <span className="font-outfit text-xs md:text-sm font-extrabold text-white line-clamp-1">{teamA.name}</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-gray-500 mb-1.5">VS</div>
              <span className="font-outfit text-xs md:text-sm font-bold text-gray-500">{match.teamAPlaceholder}</span>
            </>
          )}
        </div>

        {/* Marcador Real (Mundial) */}
        <div className="flex flex-col items-center justify-center px-2">
          {status === "finished" ? (
            <div className="font-outfit text-2xl md:text-3xl font-black text-brand-gold tracking-tight bg-black/40 border border-brand-border/40 px-3 py-1 rounded-xl">
              {finalScoreA} - {finalScoreB}
            </div>
          ) : status === "live" ? (
            <div className="font-outfit text-xl font-bold text-brand-crimson tracking-tight bg-brand-crimson/10 border border-brand-crimson/30 px-3 py-0.5 rounded-lg animate-pulse">
              EN VIVO
            </div>
          ) : (
            <div className="text-[10px] font-mono text-gray-500 font-bold uppercase bg-white/5 px-2 py-0.5 rounded-md border border-white/5 select-none">
              VS
            </div>
          )}
          <span className="text-[9px] text-gray-500 mt-1.5 text-center font-medium line-clamp-1 max-w-[100px]">
            {stadium.split(" (")[0]}
          </span>
        </div>

        {/* Equipo B */}
        <div className="flex flex-col items-center flex-1 text-center">
          {teamB ? (
            <>
              <span className="text-3xl md:text-4xl mb-1.5 filter drop-shadow-md select-none">{teamB.flag}</span>
              <span className="font-outfit text-xs md:text-sm font-extrabold text-white line-clamp-1">{teamB.name}</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-gray-500 mb-1.5">VS</div>
              <span className="font-outfit text-xs md:text-sm font-bold text-gray-500">{match.teamBPlaceholder}</span>
            </>
          )}
        </div>

      </div>

      {/* Pie de la Tarjeta (Sección de Predicción del Usuario) */}
      <div className="border-t border-white/5 pt-3 mt-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Mi Predicción:
          </span>
          
          {/* Si está guardada y no estamos editando, mostrar los números fijos */}
          {!isEditing && userPrediction && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 font-outfit text-sm font-black text-white bg-slate-900 border border-brand-border/60 px-3 py-1 rounded-lg">
                <span className="text-brand-cyan">{scoreA}</span>
                <span className="text-gray-600 font-normal">-</span>
                <span className="text-brand-cyan">{scoreB}</span>
              </div>
              
              {!isLocked && status !== "finished" && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 bg-white/5 border border-white/10 hover:border-brand-cyan/40 rounded text-gray-400 hover:text-brand-cyan cursor-pointer transition-all"
                  title="Editar Predicción"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
          )}

          {/* Si está bloqueado y no hay predicción */}
          {isLocked && !userPrediction && (
            <span className="text-xs font-semibold text-gray-600 italic">
              Sin Pronóstico
            </span>
          )}

          {/* Formulario de Entrada Activo */}
          {isEditing && !isLocked && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="99"
                  disabled={!teamA || !teamB}
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-10 h-8 text-center bg-slate-950 border border-brand-border focus:border-brand-cyan/80 text-white font-outfit font-black rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-gray-600">-</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  disabled={!teamA || !teamB}
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-10 h-8 text-center bg-slate-950 border border-brand-border focus:border-brand-cyan/80 text-white font-outfit font-black rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={scoreA === "" || scoreB === "" || isSaving || !teamA || !teamB}
                className="p-1.5 bg-brand-cyan hover:bg-brand-cyan/90 disabled:opacity-30 text-black rounded-lg transition-all cursor-pointer shadow-md hover:shadow-brand-cyan/10"
                title="Guardar Predicción"
              >
                <Save size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Panel Administrativo de Simulación en Modo Demo */}
        {isDemoMode && status !== "finished" && (
          <div className="mt-3 pt-2.5 border-t border-dashed border-white/5 flex flex-col gap-2">
            {!adminSimOpen ? (
              <button
                onClick={() => setAdminSimOpen(true)}
                className="w-full py-1 border border-dashed border-brand-cyan/20 hover:border-brand-cyan/50 bg-brand-cyan/5 text-brand-cyan hover:text-white rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play size={10} />
                Simular Partido (Admin)
              </button>
            ) : (
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-brand-cyan/20 flex flex-col gap-2 animate-float">
                <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase">
                  <span>Resultado Real del Mundial</span>
                  <button onClick={() => setAdminSimOpen(false)} className="text-brand-crimson hover:underline">Cancelar</button>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-[10px] text-gray-400 font-semibold truncate max-w-[80px]">{teamA?.name || "Team A"}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Gol"
                    value={simScoreA}
                    onChange={(e) => setSimScoreA(e.target.value)}
                    className="w-9 h-7 text-center bg-slate-900 border border-brand-border text-white text-xs font-bold rounded"
                  />
                  <span className="text-gray-500 font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Gol"
                    value={simScoreB}
                    onChange={(e) => setSimScoreB(e.target.value)}
                    className="w-9 h-7 text-center bg-slate-900 border border-brand-border text-white text-xs font-bold rounded"
                  />
                  <span className="text-[10px] text-gray-400 font-semibold truncate max-w-[80px]">{teamB?.name || "Team B"}</span>
                  
                  <button
                    onClick={handleSimulate}
                    disabled={simScoreA === "" || simScoreB === ""}
                    className="py-1 px-2.5 bg-brand-cyan text-black text-[10px] font-black uppercase rounded shadow hover:bg-brand-cyan/90 cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pie de Página: Fecha del Partido */}
      <div className="text-[9px] text-gray-600 mt-2 flex justify-between items-center select-none">
        <span>📅 {formattedDate}</span>
        <span>🏟 {stadium.split(" (")[1]?.replace(")", "") || stadium}</span>
      </div>

    </div>
  );
});
