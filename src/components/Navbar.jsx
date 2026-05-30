import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Share2, LogOut, Trophy, Check, Cpu } from "lucide-react";
import { useParams } from "react-router-dom";

export default function Navbar() {
  const { pollId } = useParams();
  const { currentUser, logout, isDemoMode, activePoll } = useStore();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    if (window.confirm("¿Seguro que deseas cerrar sesión?")) {
      logout(pollId);
    }
  };

  return (
    <header className="navbar-animate sticky top-0 z-50 w-full glass-panel px-4 md:px-8 py-3 flex flex-col md:flex-row gap-3 items-center justify-between">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center p-2 bg-brand-gold/10 border border-brand-gold/25 rounded-lg text-brand-gold"
          aria-hidden="true"
        >
          <Trophy size={18} />
        </div>
        <div>
          <h2 className="font-outfit text-lg font-extrabold tracking-tight text-brand-text uppercase leading-tight">
            {activePoll?.name || "Polla Mundial 2026"}
          </h2>
          <span className="text-xs text-brand-cyan font-semibold uppercase tracking-wider">
            FIFA World Cup 2026
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center flex-wrap justify-center gap-2">

        {isDemoMode && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-card border border-brand-border rounded-full text-xs font-bold tracking-wider text-brand-cyan uppercase"
            role="status"
            aria-label="Modo demostración activo"
          >
            <Cpu size={11} aria-hidden="true" />
            Demo
          </div>
        )}

        {currentUser && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-card border border-brand-border rounded-lg text-sm text-brand-text-secondary">
            <div
              className="w-2 h-2 rounded-full bg-brand-accent animate-status"
              aria-hidden="true"
            ></div>
            <span className="font-semibold text-brand-text">{currentUser.username}</span>
          </div>
        )}

        <button
          onClick={handleShare}
          aria-label={copied ? "Enlace copiado al portapapeles" : "Compartir enlace de la polla"}
          className="btn-interactive flex items-center gap-2 py-2 px-4 bg-brand-card border border-brand-border hover:border-brand-border-active rounded-lg text-sm font-semibold text-brand-text-secondary hover:text-brand-text cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={13} className="text-brand-accent" aria-hidden="true" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Share2 size={13} aria-hidden="true" />
              <span>Compartir</span>
            </>
          )}
        </button>

        {currentUser && (
          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="btn-interactive flex items-center justify-center p-2 min-w-[44px] min-h-[44px] bg-brand-crimson/10 border border-brand-crimson/25 hover:bg-brand-crimson/20 hover:border-brand-crimson/50 rounded-lg text-brand-crimson cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-crimson/50"
          >
            <LogOut size={15} aria-hidden="true" />
          </button>
        )}

      </div>
    </header>
  );
}
