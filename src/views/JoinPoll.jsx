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
    await joinPoll(pollId, trimmed);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-brand-bg">

      {isDemoMode && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 demo-banner-animate flex items-center gap-2 px-4 py-1.5 bg-brand-card border border-brand-border rounded-full text-xs font-semibold tracking-wider text-brand-cyan uppercase"
          role="status"
          aria-live="polite"
        >
          <Cpu size={13} aria-hidden="true" />
          Modo Demo (sin conexión)
        </div>
      )}

      {/* Card */}
      <div className="join-card-animate relative w-full max-w-md glass-card rounded-2xl overflow-hidden shadow-xl">

        {/* Top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-cyan via-brand-accent to-brand-gold" aria-hidden="true"></div>

        {/* Header */}
        <div className="p-8 text-center border-b border-brand-border">
          <div
            className="inline-flex p-3 bg-brand-gold/10 border border-brand-gold/25 rounded-full text-brand-gold mb-4"
            aria-hidden="true"
          >
            <Trophy size={36} />
          </div>

          <h1 className="font-outfit text-3xl font-extrabold tracking-tight text-brand-text mb-1 uppercase">
            Mundial 2026
          </h1>
          <p className="text-sm font-medium tracking-widest text-brand-cyan uppercase">
            Polla de Amigos
          </p>

          <div className="mt-3 inline-block px-3 py-1 bg-brand-bg border border-brand-border rounded text-xs font-mono text-brand-text-muted">
            ID: {pollId?.toUpperCase()}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold tracking-wide text-brand-text-secondary uppercase">
              Tu nombre o apodo
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ej: JuanGol, SuperClasificado..."
              maxLength={20}
              autoComplete="nickname"
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border focus:border-brand-border-active rounded-lg text-brand-text font-medium placeholder-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 transition-[border-color,box-shadow] duration-150"
            />
            <span className="block text-xs text-brand-text-muted text-right" aria-live="polite">
              {username.length}/20 caracteres
            </span>
          </div>

          {(error || localError) && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 bg-brand-crimson/10 border border-brand-crimson/30 rounded-lg text-sm font-medium text-brand-crimson"
            >
              <ShieldAlert size={15} className="shrink-0" aria-hidden="true" />
              <span>{localError || error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-interactive w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-cyan hover:bg-brand-border-active disabled:opacity-50 text-slate-900 font-extrabold text-sm tracking-wider uppercase rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-brand-card"
          >
            {loading ? "Verificando..." : "Entrar al Estadio"}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </form>

        {/* Ticket footer */}
        <div className="relative border-t border-dashed border-brand-border p-5 bg-brand-bg text-center text-xs text-brand-text-muted flex justify-between items-center">
          <div className="absolute -left-3 top-[-10px] w-6 h-6 bg-brand-bg rounded-full border-r border-brand-border" aria-hidden="true"></div>
          <div className="absolute -right-3 top-[-10px] w-6 h-6 bg-brand-bg rounded-full border-l border-brand-border" aria-hidden="true"></div>
          <span>SEC: VIP-STADIUM</span>
          <span>JUN–JUL 2026</span>
          <span>ADMIT ONE</span>
        </div>

      </div>
    </div>
  );
}
