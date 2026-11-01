import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-6 text-center">
      <Logo size="lg" className="mb-6" />
      <h1 className="text-4xl font-extrabold text-white font-mono tracking-tight">404</h1>
      <p className="text-sm text-slate-400 mt-2 max-w-sm">
        The requested screening page, session link, or asset was not found on MOTOSYNQ AI.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold text-xs transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};
