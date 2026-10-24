import React from 'react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import {
  Clock,
  FileCheck,
  ShieldCheck,
  MapPin,
  Mail,
  User,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

const mockSessionHistory = [
  {
    id: 1,
    dateTime: '2026-10-24 18:32 IST',
    ipAddress: '103.21.144.12',
    action: 'Logged In (2FA Verified)',
    status: 'Success',
  },
  {
    id: 2,
    dateTime: '2026-10-24 18:45 IST',
    ipAddress: '103.21.144.12',
    action: 'Submitted Naksha Blueprint (PDF)',
    status: 'Success',
  },
  {
    id: 3,
    dateTime: '2026-10-24 19:10 IST',
    ipAddress: '103.21.144.12',
    action: 'Generated Scrutiny Audit Report',
    status: 'Success',
  },
  {
    id: 4,
    dateTime: '2026-10-23 11:20 IST',
    ipAddress: '103.21.144.12',
    action: 'Reviewed Bye-Law Clause 4.2.1',
    status: 'Success',
  },
  {
    id: 5,
    dateTime: '2026-10-22 09:15 IST',
    ipAddress: '14.139.60.22',
    action: 'Digital Signature Authenticated',
    status: 'Success',
  },
];

export const ProfileModal = ({ isOpen, onClose, user }) => {
  const stats = [
    {
      label: 'Account Age',
      value: '14 Months',
      subtext: 'Registered Nov 2025',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label:
        user?.role === 'CITIZEN'
          ? 'Total Submissions'
          : user?.role === 'FIELD_OFFICER'
          ? 'Plans Scrutinized'
          : 'Rules Audited',
      value:
        user?.role === 'CITIZEN'
          ? '8 Plans'
          : user?.role === 'FIELD_OFFICER'
          ? '42 Reviews'
          : '156 Rules',
      subtext: '100% Bye-Law Compliant',
      icon: FileCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Security Level',
      value: 'Enhanced',
      subtext: 'Aadhaar eSign & 2FA Active',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Audit Records"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <p className="text-[11px] text-slate-400">
            Official GovTech Portal Credentials • Certified Tamper-Proof
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Prominent User Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center text-xl font-black shadow-md border-2 border-white ring-2 ring-primary-100 shrink-0">
            {user?.initials || 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-navy-900 truncate">
                {user?.name || 'Ravi Kumar'}
              </h3>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  user?.badgeColorClass || 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                {user?.badgeText || user?.role || 'Citizen Public'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{user?.zone || 'South Delhi Division'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{user?.email || 'citizen@nakshanetra.gov.in'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics Section */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Account Telemetry & Statistics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={idx}
                  padding="sm"
                  className="border border-slate-200/90 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-lg font-extrabold text-navy-900 mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-2 rounded-xl border ${stat.color} shrink-0`}
                    >
                      <Icon size={16} />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">
                    {stat.subtext}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Session History Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recent Session Audit Log
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Showing last 5 activity records
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">Date / Time</th>
                  <th className="px-3.5 py-2.5">IP Address</th>
                  <th className="px-3.5 py-2.5">Action</th>
                  <th className="px-3.5 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mockSessionHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-2.5 font-medium text-slate-600 whitespace-nowrap">
                      {item.dateTime}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {item.ipAddress}
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-navy-900">
                      {item.action}
                    </td>
                    <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} className="text-emerald-500" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
