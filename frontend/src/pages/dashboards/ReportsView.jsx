import React from 'react';
import { Card } from '../../components/ui/Card';
import { FileText, Download, ShieldCheck, Clock, Calendar, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ReportsView = ({ role = 'citizen' }) => {
  const roleTitleMap = {
    citizen: 'Citizen Architectural Reports & History',
    officer: 'Field Officer Inspection Dossiers & Audit Trails',
    admin: 'National Compliance Engine Scrutiny Reports',
  };

  const sampleReports = [
    {
      id: 'REP-2026-8812',
      title: 'Structural Sanction Clearance Notice',
      date: '24 Oct 2026',
      status: 'APPROVED',
      size: '2.4 MB',
    },
    {
      id: 'REP-2026-7734',
      title: 'Setback Deficiency & Rectification Order',
      date: '22 Oct 2026',
      status: 'REJECTED',
      size: '1.8 MB',
    },
    {
      id: 'REP-2026-6541',
      title: 'Periodic Bye-Law Automated Audit Summary',
      date: '18 Oct 2026',
      status: 'COMPLIANT',
      size: '3.1 MB',
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
            Reports & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {roleTitleMap[role] || 'Historical building plan scrutiny reports, audit logs, and compliance documentation.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
            <ShieldCheck size={14} />
            Verified Audit Stream
          </span>
        </div>
      </div>

      {/* Main GovTech Card */}
      <Card padding="lg" className="border-t-4 border-t-primary-600">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">Archived Compliance Dossiers</h2>
              <p className="text-xs text-slate-400">All reports are timestamped and digitally signed</p>
            </div>
          </div>
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Filter by report ID or title..."
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {sampleReports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-primary-300 hover:bg-primary-50/20 transition-all gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy-900">{report.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span className="font-mono text-slate-600">{report.id}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {report.date}
                    </span>
                    <span>&bull;</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    report.status === 'APPROVED' || report.status === 'COMPLIANT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {report.status}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Download size={13} />}
                  onClick={() => alert(`Downloading archived report ${report.id}...`)}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ReportsView;
