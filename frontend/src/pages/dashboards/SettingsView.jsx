import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Settings, Shield, Bell, Key, Globe, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SettingsView = ({ role = 'citizen' }) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoScrutinyNotify, setAutoScrutinyNotify] = useState(true);
  const [zone, setZone] = useState('Delhi (MCD)');

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
            Account & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Configure municipal bye-law scrutiny preferences, notification channels, and security settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Settings size={14} />
            Version 1.0.4 - Production
          </span>
        </div>
      </div>

      {/* Main GovTech Card */}
      <Card padding="lg" className="border-t-4 border-t-navy-900">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-900">Portal Preferences</h2>
            <p className="text-xs text-slate-400">Manage security protocols and automated alert channels</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Default Jurisdiction */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-primary-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-navy-900">Default Municipal Jurisdiction</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-selects local bye-law rule book for architectural plan validations
                  </p>
                </div>
              </div>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="text-xs font-semibold text-navy-900 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="Delhi (MCD)">Delhi (MCD)</option>
                <option value="Mumbai (BMC)">Mumbai (BMC)</option>
                <option value="Bangalore (BBMP)">Bangalore (BBMP)</option>
                <option value="Chennai (GCC)">Chennai (GCC)</option>
                <option value="Hyderabad (GHMC)">Hyderabad (GHMC)</option>
              </select>
            </div>
          </div>

          {/* Email Notification Alerts */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-amber-500 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-navy-900">Real-Time Scrutiny Alerts</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive SMS & Email notifications whenever a rule evaluation completes
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Security & Audit */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-navy-900">Two-Factor Authentication (Aadhaar OTP)</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mandatory for official sanction signing and rejection issuance
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Enabled
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-5 border-t border-slate-100 mt-6">
          <Button
            size="sm"
            icon={<Check size={14} />}
            onClick={() => alert('Settings updated successfully.')}
          >
            Save Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsView;
