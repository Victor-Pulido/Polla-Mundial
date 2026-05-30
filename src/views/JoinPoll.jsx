import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Trophy, ArrowRight, ShieldAlert, Cpu } from "lucide-react";

export default function JoinPoll() {
  const { pollId } = useParams();
  const [username, setUsername] = useState("");
  const { joinPoll, loading, error, isDemoMode } = useStore();
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    
    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setLocalError("El nombre debe tener entre 3 y 20 caracteres.");
      return;
    }

    const success = await joinPoll(pollId, trimmed);
    if (!success) {
      // El error de la BD/LocalStorage ya se guarda en el store
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#070A13] via-[#0B0F19] to-[#121A2D]">
      
      {/* Círculos decorativos con glows de neón en el fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>

      {/* Banner de Modo Demo */}
      {isDemoMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full text-xs font-semibold tracking-wider text-brand-cyan uppercase animate-pulse-glow">
          <Cpu size={14} className="animate-spin" />
          Corriendo en Modo Demo (Local Offline)
        </div>
      )}

      {/* Tarjeta del Ticket */}
      <div className="relative w-full max-w-md glass-card rounded-2xl border border-brand-border/40 overflow-hidden shadow-2xl">
        
        {/* Línea dorada superior */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-cyan via-brand-accent to-brand-gold"></div>

        {/* Encabezado del Ticket */}
        <div className="p-8 text-center border-b border-white/5 relative">
          <div className="inline-flex p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-full text-brand-gold mb-4 animate-bounce">
            <Trophy size={36} />
          </div>
          
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
            Mundial 2026
          </h1>
          <p className="text-sm font-medium tracking-widest text-brand-cyan uppercase">
            Polla de Amigos
          </p>
          
          {/* Identificador de la Polla */}
          <div className="mt-3 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-gray-400">
            ID: {pollId?.toUpperCase()}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-2">
            <label htmlFor="username" className="block text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Ingresa tu nombre / apodo
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: JuanGol, SuperClasificado..."
              maxLength={20}
              className="w-full px-4 py-3 bg-slate-900/60 border border-brand-border/80 focus:border-brand-cyan/70 rounded-lg text-white font-medium placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all"
            />
            <span className="block text-[10px] text-gray-500 text-right">
              Mínimo 3, máximo 20 letras
            </span>
          </div>

          {/* Manejo de Errores */}
          {(error || localError) && (
            <div className="flex items-center gap-2 p-3 bg-brand-crimson/10 border border-brand-crimson/25 rounded-lg text-xs font-medium text-brand-crimson">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Botón de Entrada */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-cyan to-brand-accent hover:from-brand-cyan/90 hover:to-brand-accent/90 disabled:opacity-50 text-black font-extrabold text-sm tracking-wider uppercase rounded-lg shadow-lg hover:shadow-brand-cyan/20 transition-all cursor-pointer"
          >
            {loading ? "Verificando..." : "Entrar al Estadio"}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Detalles del Boleto (Ticket Design Accent) */}
        <div className="relative border-t border-dashed border-white/10 p-6 bg-slate-950/40 text-center text-xs text-gray-500 flex justify-between items-center">
          {/* Círculos laterales simulando boleto perforado */}
          <div className="absolute -left-3 top-[-10px] w-6 h-6 bg-[#0B0F19] rounded-full border-r border-brand-border/40"></div>
          <div className="absolute -right-3 top-[-10px] w-6 h-6 bg-[#0B0F19] rounded-full border-l border-brand-border/40"></div>
          
          <span>SEC: VIP-STADIUM</span>
          <span>FECHA: JUN-JUL 2026</span>
          <span>ADMIT ONE 🎫</span>
        </div>

      </div>
    </div>
  );
}
