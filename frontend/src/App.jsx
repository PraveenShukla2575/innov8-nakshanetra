import React from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* GovTech Slate-900 Navbar with Role Switcher */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Dashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>
          NakshaNetra &bull; GovTech Automated Building Bye-Law Scrutiny Engine &bull; Built with FastAPI, React & Gemini 1.5
        </p>
      </footer>
    </div>
  );
}
