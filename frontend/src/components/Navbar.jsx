import React, { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store';
import { ShieldCheck, UserCheck, ChevronDown, Building, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { currentUser, usersList, setCurrentUser, setUsersList } = useAuthStore();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/users`);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setUsersList(response.data);
          const defaultCitizen =
            response.data.find((u) => u.role?.toLowerCase() === 'citizen') || response.data[0];
          setCurrentUser(defaultCitizen);
          return;
        }
      } catch (err) {
        console.warn('API /api/users unavailable, falling back to standard demo users:', err.message);
      }

      // Safe fallback demo users if backend is not yet reachable or empty
      const fallbackUsers = [
        { id: 1, name: 'Ravi', role: 'citizen' },
        { id: 2, name: 'Priya', role: 'officer' },
        { id: 3, name: 'Amit', role: 'admin' },
      ];
      setUsersList(fallbackUsers);
      setCurrentUser(fallbackUsers[0]);
    };

    fetchUsers();
  }, [setCurrentUser, setUsersList]);

  const handleUserChange = (e) => {
    const selectedId = Number(e.target.value);
    const selected = usersList.find((u) => u.id === selectedId);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'citizen':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'officer':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Branding & GovTech Badge */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Naksha<span className="text-sky-400">Netra</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  GovTech Scrutiny
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-400 font-normal">
                Automated Building Bye-Law Compliance Engine
              </p>
            </div>
          </div>

          {/* Right: Magic Demo Role Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Demo Role Switcher</span>
            </div>

            {/* Active Role Indicator */}
            {currentUser && (
              <span
                className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full border ${getRoleBadgeStyle(
                  currentUser.role
                )}`}
              >
                {currentUser.role}
              </span>
            )}

            {/* Role Dropdown */}
            <div className="relative flex items-center">
              <label htmlFor="role-select" className="sr-only">
                Switch User Role
              </label>
              <div className="flex items-center bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg px-2.5 py-1.5 transition-colors focus-within:ring-2 focus-within:ring-sky-500">
                <UserCheck className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                <select
                  id="role-select"
                  value={currentUser ? currentUser.id : ''}
                  onChange={handleUserChange}
                  className="bg-transparent text-sm text-slate-100 font-medium focus:outline-none cursor-pointer pr-5 appearance-none"
                >
                  {usersList.map((user) => (
                    <option key={user.id} value={user.id} className="bg-slate-900 text-white">
                      {user.name} ({user.role ? user.role.toUpperCase() : 'USER'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400 pointer-events-none -ml-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
