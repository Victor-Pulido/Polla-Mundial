import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Share2, LogOut, Trophy, Check, Cpu } from "lucide-react";
import { useParams } from "react-router-dom";

export default function Navbar() {
  const { pollId } = useParams();
  const { currentUser, logout, isDemoMode, activePoll } = useStore();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    // Copiar URL de invitación directa a portapapeles
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    if (window.confirm("¿Seguro que deseas salir de tu sesión actual?")) {
      logout(pollId);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-brand-border/40 px-4 md:px-8 py-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
      
      {/* Logotipo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center p-2.5 bg-brand-gold/15 border border-brand-gold/30 rounded-xl text-brand-gold shadow-md shadow-brand-gold/5 animate-pulse">
          <Trophy size={20} />
        </div>
        <div>
          <h2 className="font-outfit text-xl font-extrabold tracking-tight text-white uppercase m-0 leading-none">
            {activePoll?.name || "Polla Mundial 2026"}
          </h2>
          <span className="text-[10px] text-brand-cyan tracking-wider font-semibold uppercase">
            Mundial de la FIFA 2026™
          </span>
        </div>
      </div>

      {/* Acciones del Usuario */}
      <div className="flex items-center flex-wrap justify-center gap-3">
        
        {/* Banner Demo en Navbar */}
        {isDemoMode && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full text-[10px] font-bold tracking-wider text-brand-cyan uppercase">
            <Cpu size={12} />
            Demo Mode
          </div>
        )}

        {/* Tarjeta de Sesión */}
        {currentUser && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-ping"></div>
            <span className="font-semibold text-white">
              {currentUser.username}
            </span>
          </div>
        )}

        {/* Botón de Compartir */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 py-1.5 px-4 bg-slate-900 border border-brand-border/70 hover:border-brand-cyan/50 rounded-lg text-xs font-bold text-gray-300 hover:text-brand-cyan transition-all cursor-pointer shadow-md"
        >
          {copied ? (
            <>
              <Check size={14} className="text-brand-accent" />
              <span>¡Enlace Copiado!</span>
            </>
          ) : (
            <>
              <Share2 size={14} />
              <span>Compartir Polla</span>
            </>
          )}
        </button>

        {/* Botón Salir */}
        {currentUser && (
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="flex items-center justify-center p-2 bg-brand-crimson/10 border border-brand-crimson/20 hover:bg-brand-crimson/20 hover:border-brand-crimson/40 rounded-lg text-brand-crimson transition-all cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        )}

      </div>
    </header>
  );
}
