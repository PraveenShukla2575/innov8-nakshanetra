import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  ShieldCheck,
  Building2,
  FileUp,
  FileText,
  ClipboardList,
  Activity,
  Sparkles,
  BookOpen,
  Settings,
  UserCheck,
} from 'lucide-react';

const roleProfiles = {
  citizen: {
    portalTitle: 'Citizen Portal',
    portalSubtitle: 'Building Plan Self-Service & Compliance Submission',
    badgeText: 'Citizen Public',
    badgeColorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    user: { name: 'Ravi Kumar', role: 'CITIZEN', zone: 'South Delhi Division' },
    navItems: [
      { path: '/citizen', label: 'Submit Naksha & Overview', icon: FileUp },
      { path: '/citizen/applications', label: 'My Submissions', icon: FileText, badge: '3' },
      { path: '/citizen/guidelines', label: 'Bye-Law Guidelines', icon: BookOpen },
    ],
  },
  officer: {
    portalTitle: 'Officer Portal',
    portalSubtitle: 'GovTech Field Scrutiny & Sanction Review Queue',
    badgeText: 'Enforcement Officer',
    badgeColorClass: 'bg-blue-100 text-blue-800 border-blue-200',
    user: { name: 'Priya Sharma', role: 'FIELD_OFFICER', zone: 'Zone IV Scrutiny Wing' },
    navItems: [
      { path: '/officer', label: 'Scrutiny Queue', icon: ClipboardList, badge: '5' },
      { path: '/officer/inspections', label: 'Site Verifications', icon: Building2 },
      { path: '/officer/reports', label: 'Compliance Reports', icon: Activity },
    ],
  },
  admin: {
    portalTitle: 'Admin Portal',
    portalSubtitle: 'National Building Code Engine Governance & Audit',
    badgeText: 'System Admin',
    badgeColorClass: 'bg-slate-900 text-white border-slate-700',
    user: { name: 'Amit Verma', role: 'DEV_ADMIN', zone: 'National Compliance HQ' },
    navItems: [
      { path: '/admin', label: 'Platform Telemetry', icon: Activity },
      { path: '/admin/audit', label: 'Scrutiny Audit Logs', icon: ShieldCheck },
      { path: '/admin/rules', label: 'Bye-Law Rule Engine', icon: Settings },
    ],
  },
};

export const RolePortalLayout = ({
  backendStatus = 'checking',
  backendMessage = '',
  onLogout = () => {},
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current active role from URL
  const currentRoleKey = location.pathname.startsWith('/officer')
    ? 'officer'
    : location.pathname.startsWith('/admin')
    ? 'admin'
    : 'citizen';

  const activeConfig = roleProfiles[currentRoleKey];

  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('gov_sidebar_expanded');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('gov_sidebar_expanded', isExpanded.toString());
  }, [isExpanded]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarCollapsed = !isExpanded;

  const currentNav = activeConfig.navItems.find(
    (n) => location.pathname === n.path || (n.path !== `/${currentRoleKey}` && location.pathname.startsWith(n.path))
  );

  const pageTitle = currentNav?.label ?? activeConfig.portalTitle;
  const displayName = activeConfig.user.name;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleRoleChange = (e) => {
    const newPath = e.target.value;
    navigate(newPath);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col bg-white border-r border-slate-200 text-navy-800
          sidebar-transition
          ${sidebarCollapsed ? 'w-[76px]' : 'w-80'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div
          className={`flex items-center py-3 px-4 border-b border-slate-200 ${
            sidebarCollapsed ? 'justify-center h-20' : 'gap-3.5 h-20'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-primary-600/30">
            <Building2 size={22} />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-lg font-extrabold leading-none text-navy-900 truncate">
                Naksha<span className="text-primary-600">Netra</span>
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${activeConfig.badgeColorClass}`}
                >
                  {activeConfig.badgeText}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-5 overflow-y-auto">
          <ul className="space-y-1.5 px-3">
            {activeConfig.navItems.map(({ path, label, icon: Icon, badge }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === `/${currentRoleKey}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    group flex items-center rounded-xl transition-all duration-150 relative
                    ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3.5 px-3.5 py-2.5'}
                    ${
                      isActive
                        ? 'bg-primary-50/90 text-primary-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100/80'
                    }
                  `}
                  title={sidebarCollapsed ? label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={20}
                        strokeWidth={isActive ? 2.2 : 1.7}
                        className={`shrink-0 ${
                          isActive
                            ? 'text-primary-600'
                            : 'text-slate-500 group-hover:text-slate-700'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <span className="text-sm truncate flex-1">{label}</span>
                      )}
                      {!sidebarCollapsed && badge !== undefined && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Role Quick Switcher in Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 mx-3 mb-2 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1.5 text-slate-500">
              <Sparkles size={13} className="text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Demo Switcher</span>
            </div>
            <select
              value={`/${currentRoleKey}`}
              onChange={handleRoleChange}
              className="w-full text-xs font-semibold text-navy-800 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
            >
              <option value="/citizen">Citizen Portal</option>
              <option value="/officer">Field Officer Portal</option>
              <option value="/admin">Admin Workspace</option>
            </select>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex items-center justify-center py-3 border-t border-slate-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Viewport Container */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50">
        {/* Header Bar */}
        <header className="flex items-center justify-between h-16 px-4 lg:px-8 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base lg:text-lg font-bold text-navy-900 leading-tight">
                  {pageTitle}
                </h1>
                <span
                  className={`hidden sm:inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${activeConfig.badgeColorClass}`}
                >
                  {activeConfig.portalTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block mt-0.5 truncate max-w-md">
                {activeConfig.portalSubtitle}
              </p>
            </div>
          </div>

          {/* Header Controls: Role Switcher, Backend Health, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Demo Role Switcher Dropdown (Header) */}
            <div className="flex items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl px-2.5 py-1.5 transition-colors">
              <UserCheck size={14} className="text-primary-600 mr-1.5 shrink-0" />
              <select
                aria-label="Demo Role Switcher"
                value={`/${currentRoleKey}`}
                onChange={handleRoleChange}
                className="bg-transparent text-xs font-bold text-navy-900 focus:outline-none cursor-pointer pr-1"
              >
                <option value="/citizen">Citizen</option>
                <option value="/officer">Officer</option>
                <option value="/admin">Admin</option>
              </select>
            </div>

            {/* Backend Health Check Pill */}
            {backendStatus === 'connected' ? (
              <div
                title={backendMessage || 'FastAPI Backend Healthy'}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Backend Connected</span>
              </div>
            ) : backendStatus === 'checking' ? (
              <div
                title="Pinging FastAPI backend..."
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Connecting...</span>
              </div>
            ) : (
              <div
                title={backendMessage || 'Cannot connect to http://localhost:8000/api/health'}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="hidden sm:inline">Backend Disconnected</span>
              </div>
            )}

            {/* User Profile Badge */}
            <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-800 text-xs font-bold border border-primary-200">
                {initials}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-navy-900 leading-tight truncate max-w-[140px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate max-w-[140px]">
                  {activeConfig.user.zone}
                </p>
              </div>
            </div>

            {/* Notifications Bell */}
            <button
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell size={17} />
            </button>

            {/* Sign Out */}
            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Exit</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="fade-in max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RolePortalLayout;
