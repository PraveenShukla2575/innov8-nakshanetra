import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

export default function App() {
  const [healthStatus, setHealthStatus] = useState('loading'); // 'loading' | 'connected' | 'error'
  const [healthData, setHealthData] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState([]);

  // Fetch health status on component mount
  const checkHealth = async () => {
    try {
      setHealthStatus('loading');
      const response = await axios.get(`${BACKEND_URL}/api/health`);
      setHealthData(response.data);
      setHealthStatus('connected');
      setLastChecked(new Date().toLocaleTimeString());
      fetchData();
    } catch (err) {
      console.error('Health check failed:', err);
      setHealthStatus('error');
      setHealthData(null);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  const fetchData = async () => {
    try {
      const [usersRes, rulesRes] = await Promise.allSettled([
        axios.get(`${BACKEND_URL}/api/users`),
        axios.get(`${BACKEND_URL}/api/rules`),
      ]);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (rulesRes.status === 'fulfilled') setRules(rulesRes.value.data);
    } catch (e) {
      console.warn('Initial data load error:', e);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/setup`);
      setSeedResult({ success: true, data: response.data });
      await fetchData();
    } catch (err) {
      setSeedResult({
        success: false,
        message: err.response?.data?.detail || err.message || 'Database setup failed',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top GovTech Banner */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Official Civic Scrutiny Infrastructure • Govt. of India Digital Initiative</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>STAGE 1: SCAFFOLDING &amp; DB SETUP</span>
          <span>•</span>
          <span>ENV: FASTAPI + REACT + SUPABASE</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-slate-900 text-white shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black text-xl tracking-wider">
              NN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  NakshaNetra - Civic Tech Engine
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  v1.0 BETA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Automated Building Plan Compliance &amp; Regulatory Scrutiny Engine
              </p>
            </div>
          </div>

          {/* Real-time Status Indicator Badge */}
          <div className="flex items-center gap-3">
            {healthStatus === 'connected' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold tracking-wide">Backend Connected</span>
              </div>
            )}

            {healthStatus === 'loading' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sm">
                <svg className="animate-spin h-3 w-3 text-amber-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span className="text-xs font-semibold tracking-wide">Connecting...</span>
              </div>
            )}

            {healthStatus === 'error' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-sm">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-xs font-semibold tracking-wide">Disconnected</span>
              </div>
            )}

            <button
              onClick={checkHealth}
              title="Ping Backend API"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs flex items-center gap-1.5 font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full space-y-6">
        {/* Verification Overview Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sky-600 font-semibold text-xs tracking-wider uppercase mb-1">
                <span>Stage 1 Status Check</span>
                <span>•</span>
                <span>CORS &amp; API Link</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                System Verification &amp; Compliance Hub
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                NakshaNetra integrates FastAPI backend services with Supabase PostgreSQL to perform building bye-law verification, automated setback scrutiny, and compliance validation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding || healthStatus !== 'connected'}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md transition-all ${
                  isSeeding || healthStatus !== 'connected'
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/25 hover:shadow-sky-500/35 hover:-translate-y-0.5'
                }`}
              >
                {isSeeding ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Seeding Database...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7h16m-5 5H9m3-3v6" />
                    </svg>
                    <span>Seed Initial Mock Data (POST /api/setup)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Seed Feedback Message */}
          {seedResult && (
            <div
              className={`mt-4 p-4 rounded-xl border text-sm flex items-start gap-3 ${
                seedResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="mt-0.5">
                {seedResult.success ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{seedResult.data?.message || seedResult.message}</p>
                {seedResult.data && (
                  <p className="text-xs text-emerald-700 mt-1 font-mono">
                    Seeded: {seedResult.data.seeded ? 'Yes' : 'Already Seeded'} • Users: {users.length} • Rules: {rules.length}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Diagnostic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Check Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Endpoint Diagnostic</span>
                <span className="font-mono text-xs text-slate-500">GET /api/health</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Backend Health Probe</h3>
              <p className="text-slate-600 text-xs mb-4">
                Validates CORS authorization between Vite client and FastAPI server.
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 text-slate-200 font-mono text-xs">
              <div className="text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-2 flex justify-between">
                <span>PAYLOAD</span>
                <span>{lastChecked ? `Updated ${lastChecked}` : 'Waiting...'}</span>
              </div>
              {healthData ? (
                <pre className="text-emerald-400 whitespace-pre-wrap">
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              ) : healthStatus === 'loading' ? (
                <span className="text-amber-400 animate-pulse">Pinging backend...</span>
              ) : (
                <span className="text-rose-400">Connection Failed (Is backend running on :8000?)</span>
              )}
            </div>
          </div>

          {/* Seeded Users Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Schema</span>
                <span className="font-mono text-xs text-slate-500">ORM: User</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Registered Actors</h3>
              <p className="text-slate-600 text-xs mb-4">
                Mock users seeded with role-based governance permissions.
              </p>
            </div>

            <div className="space-y-2">
              {users.length > 0 ? (
                users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800">{u.name}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : u.role === 'officer'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Click &quot;Seed Initial Mock Data&quot; to populate users
                </div>
              )}
            </div>
          </div>

          {/* Compliance Rules Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Compliance Engine</span>
                <span className="font-mono text-xs text-slate-500">ORM: Rule</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Building Bye-Laws</h3>
              <p className="text-slate-600 text-xs mb-4">
                Regulatory rule constraints used by the scrutiny algorithm.
              </p>
            </div>

            <div className="space-y-2">
              {rules.length > 0 ? (
                rules.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
                  >
                    <div className="flex justify-between items-center text-slate-800 font-bold mb-1">
                      <span className="text-sky-600">{r.rule_code}</span>
                      <span className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                        {r.operator} {r.required_value}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{r.parameter}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Click &quot;Seed Initial Mock Data&quot; to populate rules
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Architectural Tech Stack Specification */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 mb-4">
            Stage 1 Architectural Blueprint
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-slate-400 text-[10px] mb-1">FRONTEND</div>
              <div className="font-semibold text-slate-200">React + Vite</div>
              <div className="text-slate-400 text-[11px] mt-1">Tailwind CSS + Axios</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-slate-400 text-[10px] mb-1">BACKEND</div>
              <div className="font-semibold text-slate-200">FastAPI + Uvicorn</div>
              <div className="text-slate-400 text-[11px] mt-1">Port 8000 • Async API</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-slate-400 text-[10px] mb-1">DATABASE &amp; ORM</div>
              <div className="font-semibold text-slate-200">SQLAlchemy 2.x</div>
              <div className="text-slate-400 text-[11px] mt-1">Supabase PostgreSQL</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-slate-400 text-[10px] mb-1">CORS SECURITY</div>
              <div className="font-semibold text-emerald-400">Whitelist Enabled</div>
              <div className="text-slate-400 text-[11px] mt-1">localhost:5173</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        NakshaNetra GovTech Engine • Innov8 Hackathon Stage 1 • Building Compliance Scrutiny
      </footer>
    </div>
  );
}
