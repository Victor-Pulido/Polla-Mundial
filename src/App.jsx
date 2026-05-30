import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useStore } from "./store/useStore";
import JoinPoll from "./views/JoinPoll";
import Dashboard from "./views/Dashboard";

function PollWrapper() {
  const { pollId } = useParams();
  const { currentUser, loadPollData } = useStore();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem(`current_user_${pollId}`);
        if (storedUser) {
          // Si hay sesión en LocalStorage, cargar datos directamente
          await loadPollData(pollId);
        }
      } catch (e) {
        console.error("Error al restaurar sesión:", e);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [pollId, loadPollData]);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-brand-cyan border-t-transparent animate-spin"></div>
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Restaurando Credenciales...</span>
        </div>
      </div>
    );
  }

  // Si no está registrado en esta polla, mostrar pantalla de ingreso
  if (!currentUser) {
    return <JoinPoll />;
  }

  // De lo contrario, ir directamente al dashboard
  return <Dashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal de la Polla */}
        <Route path="/polla/:pollId" element={<PollWrapper />} />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/polla/default-poll" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
