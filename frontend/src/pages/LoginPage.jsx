import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuthStore } from '../store';
import {
  ScanLine,
  ShieldCheck,
  FileCheck2,
  Lock,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  User,
  Briefcase,
  AlertCircle,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const MUNICIPAL_ZONES = [
  'Delhi (MCD)',
  'Mumbai (BMC)',
  'Bangalore (BBMP)',
  'Chennai (GCC)',
  'Hyderabad (GHMC)',
  'Kolkata (KMC)',
  'Lucknow (LMC)',
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState(null);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [zone, setZone] = useState(MUNICIPAL_ZONES[0]);
  const [accountType, setAccountType] = useState('citizen');
  const [rememberMe, setRememberMe] = useState(true);

  // Quick Demo Auto-Fill (RBAC Testing)
  const handleQuickDemo = (role) => {
    setSelectedDemoRole(role);
    if (role === 'admin') {
      setEmail('admin@nakshanetra.gov.in');
      setPassword('Admin@Naksha2026');
      setZone('Delhi (MCD)');
      setFullName('Amit Verma (System Admin)');
      setAccountType('admin');
    } else if (role === 'officer') {
      setEmail('officer.priya@mcd.gov.in');
      setPassword('Officer@Naksha2026');
      setZone('Delhi (MCD)');
      setFullName('Priya Sharma (Field Officer)');
      setAccountType('officer');
    } else {
      // citizen
      setEmail('citizen.ravi@gmail.com');
      setPassword('Citizen@Naksha2026');
      setZone('Delhi (MCD)');
      setFullName('Ravi Kumar (Citizen)');
      setAccountType('citizen');
    }
  };

  // Form submission & routing logic
  const handleSubmit = (e) => {
    e.preventDefault();

    // Determine target role from quick demo, email domain, or register account type
    let finalRole = selectedDemoRole || 'citizen';

    if (activeTab === 'register') {
      finalRole = accountType;
    } else {
      const lowerEmail = email.toLowerCase();
      if (lowerEmail.includes('admin')) {
        finalRole = 'admin';
      } else if (lowerEmail.includes('officer') || lowerEmail.includes('field')) {
        finalRole = 'officer';
      } else if (selectedDemoRole) {
        finalRole = selectedDemoRole;
      } else {
        finalRole = 'citizen';
      }
    }

    // Update global user state
    setCurrentUser({
      id: finalRole === 'admin' ? 3 : finalRole === 'officer' ? 2 : 1,
      name:
        fullName.trim() ||
        (finalRole === 'admin'
          ? 'Amit Verma'
          : finalRole === 'officer'
          ? 'Priya Sharma'
          : 'Ravi Kumar'),
      email: email || `${finalRole}@nakshanetra.gov.in`,
      role: finalRole,
      zone: zone,
    });

    // Navigate to respective dashboard
    if (finalRole === 'admin') {
      navigate('/admin');
    } else if (finalRole === 'officer') {
      navigate('/officer');
    } else {
      navigate('/citizen');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans">
      {/* ========================================================= */}
      {/* 1. LEFT PANEL: Brand Authority (Deep Navy Theme)           */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 bg-[#0B1120] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Subtle Architectural Grid / Blueprint Watermark Overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #60A5FA 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Faint Shield Watermark Graphic */}
        <div className="absolute -right-20 -bottom-20 w-[480px] h-[480px] opacity-[0.04] pointer-events-none rounded-full blur-2xl bg-blue-500" />
        <div className="absolute right-10 top-1/3 w-96 h-96 opacity-[0.06] pointer-events-none">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-400">
            <path
              d="M100 15L170 45V105C170 148 140 182 100 195C60 182 30 148 30 105V45L100 15Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="6 6"
            />
            <circle cx="100" cy="105" r="45" stroke="currentColor" strokeWidth="2" />
            <path d="M75 105L92 122L125 89" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Top: Branding & Subtitle */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/10 p-2 border border-white/15 backdrop-blur-md flex items-center justify-center shadow-xl shadow-black/30">
              <img src={logo} alt="NakshaNetra Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-white">NakshaNetra</span>
            </div>
          </div>

          <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg font-normal">
            AI-powered architectural scrutiny and compliance verification against Municipal Building
            Bye-Laws.
          </p>
        </div>

        {/* Middle: Core Capabilities List */}
        <div className="relative z-10 my-10 lg:my-14 space-y-6 max-w-lg">
          <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            Core Capabilities
          </p>

          <div className="space-y-4">
            {/* Capability 1 */}
            <div className="flex items-start gap-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-400 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                <ScanLine size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AI-Powered Plan Scanning</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Vision AI extracts architectural dimensions directly from Naksha PDFs.
                </p>
              </div>
            </div>

            {/* Capability 2 */}
            <div className="flex items-start gap-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-400 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Real-Time Compliance Checks</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Instant deterministic rule-engine evaluation against building codes.
                </p>
              </div>
            </div>

            {/* Capability 3 */}
            <div className="flex items-start gap-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-400 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                <FileCheck2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Automated Audit Reports</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Generate scrutiny reports with a fully transparent evidence trail.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Stats Strip */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight">5,420+</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Plans Scrutinized
              </p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight">82.4%</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Compliance Rate
              </p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight">45</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Active Municipalities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. RIGHT PANEL: Auth Workspace (White / Slate-50)          */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative overflow-y-auto min-h-screen">
        {/* Subtle background dotted pattern */}
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="w-full max-w-[500px] relative z-10 py-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Welcome to the Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Building Plan Enforcement & Compliance Workspace
            </p>
          </div>

          {/* Centered Auth Card with vibrant blue top border */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 overflow-hidden">
            {/* Top Blue Accent Strip */}
            <div className="h-1.5 w-full bg-blue-600" />

            <div className="p-6 sm:p-8 space-y-5">
              {/* Login / Register Toggle Tabs */}
              <div className="flex border-b border-slate-100 gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`pb-2.5 text-sm font-bold transition-all relative ${
                    activeTab === 'login'
                      ? 'text-navy-900 border-b-2 border-blue-600'
                      : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`pb-2.5 text-sm font-bold transition-all relative ${
                    activeTab === 'register'
                      ? 'text-navy-900 border-b-2 border-blue-600'
                      : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form Title & Subtitle */}
              <div>
                <h3 className="text-lg font-bold text-navy-900">
                  {activeTab === 'login' ? 'Portal Login' : 'Create Account'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeTab === 'login'
                    ? 'Sign in with your credentials to access the portal'
                    : 'Register your credentials to access the portal'}
                </p>
              </div>

              {/* Blue Warning Alert Box */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5 text-blue-900">
                <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold leading-tight text-blue-900">
                    Official Government System
                  </p>
                  <p className="text-[11px] text-blue-700/90 leading-relaxed mt-0.5">
                    Unauthorized access is prohibited under the IT Act, 2000. All activities are
                    monitored and logged for security audit.
                  </p>
                </div>
              </div>

              {/* Quick Demo Logins (RBAC Testing Pill Strip) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-500" />
                    Quick Demo Logins (RBAC Testing):
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Click to fill</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      selectedDemoRole === 'admin'
                        ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('officer')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      selectedDemoRole === 'officer'
                        ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Field Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('citizen')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      selectedDemoRole === 'citizen'
                        ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Citizen
                  </button>
                </div>
              </div>

              {/* Form Component */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Register Only: Full Name */}
                {activeTab === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full text-xs sm:text-sm text-navy-900 bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                      />
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                )}

                {/* Official Email ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email ID
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setSelectedDemoRole(null);
                      }}
                      placeholder={activeTab === 'register' ? 'name@mcd.gov.in' : 'official@mcd.gov.in'}
                      className="w-full text-xs sm:text-sm text-navy-900 bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full text-xs sm:text-sm text-navy-900 bg-white border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Register Only: Confirm Password */}
                {activeTab === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full text-xs sm:text-sm text-navy-900 bg-white border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                      />
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Register Only: Account Type Dropdown */}
                {activeTab === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Type
                    </label>
                    <div className="relative">
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="w-full text-xs sm:text-sm text-navy-900 bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="citizen">Citizen / Applicant (Immediate Access)</option>
                        <option value="officer">Field Enforcement Officer (Zone Verification)</option>
                        <option value="admin">System Admin (National Rule Governance)</option>
                      </select>
                      <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Zone / Jurisdiction Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Zone / Jurisdiction
                  </label>
                  <div className="relative">
                    <select
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full text-xs sm:text-sm text-navy-900 bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {MUNICIPAL_ZONES.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember me</span>
                  </label>
                  {activeTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent to registered email address.')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                >
                  <span>{activeTab === 'login' ? 'Sign In to Portal' : 'Create Account'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Bottom Policy Subtext */}
              <p className="text-[11px] text-center text-slate-400 leading-normal pt-2">
                By signing in, you agree to the{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()} className="text-slate-600 hover:underline font-medium">
                  Government IT Policy
                </a>{' '}
                and{' '}
                <a href="#security" onClick={(e) => e.preventDefault()} className="text-slate-600 hover:underline font-medium">
                  Data Security Guidelines
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
