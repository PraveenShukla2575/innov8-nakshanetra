import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { ProfileModal } from '../profile/ProfileModal';
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
  BookOpen,
  Settings,
  Terminal,
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
  navItems,
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
  const effectiveNavItems = navItems || activeConfig.navItems;

  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('gov_sidebar_expanded');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('gov_sidebar_expanded', isExpanded.toString());
  }, [isExpanded]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const sidebarCollapsed = !isExpanded;

  const currentNav = effectiveNavItems.find(
    (n) => location.pathname === n.path || (n.path !== `/${currentRoleKey}` && location.pathname.startsWith(n.path))
  );

  const pageTitle = currentNav?.label ?? activeConfig.portalTitle;
  const displayName = activeConfig.user.name;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const user = {
    name: displayName,
    role: activeConfig.user.role,
    zone: activeConfig.user.zone,
    email: `${currentRoleKey}@nakshanetra.gov.in`,
    badgeText: activeConfig.badgeText,
    badgeColorClass: activeConfig.badgeColorClass,
    initials,
  };

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
          className={`flex items-center border-b border-slate-200 transition-all duration-200 ${
            sidebarCollapsed ? 'justify-center px-2 h-20' : 'gap-3.5 px-4 h-20'
          }`}
        >
          <img
            src={logo}
            alt="NakshaNetra Logo"
            className={`${
              sidebarCollapsed ? 'h-12 w-12' : 'h-16 w-16'
            } object-contain shrink-0 transition-all duration-200 drop-shadow-xs`}
          />
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xl font-black tracking-tight leading-tight text-navy-900 truncate">
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
            {effectiveNavItems.map(({ path, label, icon: Icon, badge }) => (
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

        {/* Developer-Only Demo Mode Switcher */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80">
          {!sidebarCollapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Terminal size={12} className="text-slate-400" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Demo Mode
                  </span>
                </div>
                <span className="text-[9px] font-mono bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                  dev-switch
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-lg">
                {[
                  { id: 'citizen', label: 'Citizen', path: '/citizen' },
                  { id: 'officer', label: 'Officer', path: '/officer' },
                  { id: 'admin', label: 'Admin', path: '/admin' },
                ].map((item) => {
                  const isActive = currentRoleKey === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={`py-1 text-[11px] font-semibold rounded-md transition-all text-center cursor-pointer ${
                        isActive
                          ? 'bg-white text-navy-900 shadow-xs'
                          : 'text-slate-600 hover:text-navy-900 hover:bg-white/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Developer Demo Switcher">
              <select
                aria-label="Demo Role"
                value={`/${currentRoleKey}`}
                onChange={handleRoleChange}
                className="w-11 h-7 text-[10px] font-mono font-bold bg-slate-200/80 text-slate-700 rounded-md text-center cursor-pointer focus:outline-none"
              >
                <option value="/citizen">CIT</option>
                <option value="/officer">OFF</option>
                <option value="/admin">ADM</option>
              </select>
            </div>
          )}
        </div>

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

          {/* Header Controls: Profile Box, Notifications, Log Out */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Profile Container (Interactive Modal Trigger) */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              title="Click to view User Profile & Audit Records"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-800 text-xs font-bold border border-primary-200 shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-navy-900 leading-tight truncate max-w-[140px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate max-w-[140px]">
                  {activeConfig.user.zone}
                </p>
              </div>
            </button>

            {/* Notifications Bell */}
            <button
              type="button"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={17} />
            </button>

            {/* Log Out */}
            <button
              type="button"
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut size={14} />
              <span>Log Out</span>
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

      {/* User Profile & Audit History Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default RolePortalLayout;
