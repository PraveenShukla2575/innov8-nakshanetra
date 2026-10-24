import React, { useState } from 'react';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  FileText,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const OfficerDashboard = () => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [applications, setApplications] = useState([
    {
      id: 'APP-2026-1044',
      timestamp: '2026-10-24T09:45:00Z',
      title: 'Commercial Complex Phase-2 (G+4)',
      category: 'Commercial Complex',
      entity: 'Okhla Ind. Area, Plot 45B',
      status: 'PENDING',
      officer: 'Priya Sharma (You)',
      violations: [
        { code: 'BL-001', rule: 'Rear Setback Distance', actual: '2.20 m', required: 'Min 3.00 m', severity: 'Deficient' },
        { code: 'BL-004', rule: 'Emergency Fire Exit Staircase Width', actual: '1.50 m', required: 'Min 1.50 m', severity: 'Compliant' },
      ],
    },
    {
      id: 'APP-2026-1102',
      timestamp: '2026-10-23T16:20:00Z',
      title: 'Mixed-Use Retail & Residential (G+3)',
      category: 'Mixed-Use',
      entity: 'Sector 22, Rohini, Plot 18',
      status: 'FLAGGED',
      officer: 'Priya Sharma (You)',
      violations: [
        { code: 'BL-002', rule: 'Ground Coverage Ratio', actual: '53.2%', required: 'Max 50.0%', severity: 'Excessive' },
        { code: 'BL-003', rule: 'Floor Area Ratio (FAR)', actual: '198', required: 'Max 200', severity: 'Compliant' },
      ],
    },
    {
      id: 'APP-2026-0988',
      timestamp: '2026-10-22T11:10:00Z',
      title: 'Industrial Logistics Hub & Depot',
      category: 'Industrial',
      entity: 'Narela Phase 1, Shed 4',
      status: 'PENDING',
      officer: 'Priya Sharma (You)',
      violations: [
        { code: 'BL-005', rule: 'Front Road Right of Way (ROW)', actual: '18.0 m', required: 'Min 18.0 m', severity: 'Compliant' },
      ],
    },
    {
      id: 'APP-2026-0912',
      timestamp: '2026-10-21T14:30:00Z',
      title: 'Eco-Living Villa Complex (G+2)',
      category: 'Residential - Plotted',
      entity: 'Sector 14, Dwarka, Plot 89',
      status: 'APPROVED',
      officer: 'Priya Sharma (You)',
      violations: [
        { code: 'BL-ALL', rule: 'All NBC 2016 Bye-Laws', actual: '100% Pass', required: 'Pass', severity: 'Compliant' },
      ],
    },
    {
      id: 'APP-2026-0730',
      timestamp: '2026-10-19T10:00:00Z',
      title: 'Packaging Distribution Centre',
      category: 'Industrial & Warehouse',
      entity: 'Bawana Industrial Estate',
      status: 'REJECTED',
      officer: 'Priya Sharma (You)',
      violations: [
        { code: 'BL-007', rule: 'Hazardous Chemical Buffer Zone', actual: '5.0 m', required: 'Min 12.0 m', severity: 'Critical Hazard' },
      ],
    },
  ]);

  const handleApprove = (appId) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: 'APPROVED' } : app))
    );
    setSelectedApp(null);
  };

  const handleReject = (appId) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: 'REJECTED' } : app))
    );
    setSelectedApp(null);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Officer Station Hero Banner (Navy/Indigo) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-primary-800 to-navy-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 border border-primary-400/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} />
            Field Scrutiny Enforcement Wing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Building Bye-Law Scrutiny Queue
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Examine computer vision & rule-engine flagged deviations in building sanction plans.
            Verify setbacks, Floor Area Ratios (FAR), ground coverages, and fire safety codes before
            issuing municipal clearance.
          </p>
        </div>
      </div>

      {/* Supervisory Alert Strip */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">Priority Applications Awaiting Officer Signoff</p>
            <p className="text-xs text-amber-700">
              3 plans contain geometric setback or coverage deviations exceeding tolerance margins.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-200 text-amber-900 shrink-0">
          Action Required
        </span>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Queue
            </p>
            <h3 className="text-xl font-black text-navy-900 mt-0.5">
              {applications.filter((a) => a.status === 'PENDING').length} Plans
            </h3>
            <p className="text-[11px] text-slate-400">Assigned to your desk</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Deficiency Flags
            </p>
            <h3 className="text-xl font-black text-red-600 mt-0.5">
              {applications.filter((a) => a.status === 'FLAGGED' || a.status === 'NON_COMPLIANT').length} Flags
            </h3>
            <p className="text-[11px] text-red-600/80">Requires inspection</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cleared Today
            </p>
            <h3 className="text-xl font-black text-emerald-600 mt-0.5">
              {applications.filter((a) => a.status === 'APPROVED').length} Approved
            </h3>
            <p className="text-[11px] text-emerald-600/80">Digital sanction seals</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average SLA
            </p>
            <h3 className="text-xl font-black text-navy-900 mt-0.5">18 min</h3>
            <p className="text-[11px] text-slate-400">Auto-scrutiny turnaround</p>
          </div>
        </Card>
      </div>

      {/* Scrutiny Queue Data Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-navy-900" />
            <h2 className="text-lg font-bold text-navy-900">Assigned Inspection Queue</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Click any row to inspect bye-law analysis
          </span>
        </div>

        <DataTable
          title="Field Officer Scrutiny Roster"
          data={applications}
          onViewDetails={(row) => setSelectedApp(row)}
          onExportRow={(row) =>
            alert(`Exporting Officer Inspection Dossier for ${row.id}...`)
          }
        />
      </div>

      {/* Application Inspection Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Officer Scrutiny & Rule Audit: ${selectedApp.id}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="ghost" onClick={() => setSelectedApp(null)}>
                Dismiss
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  icon={<X size={15} />}
                  onClick={() => handleReject(selectedApp.id)}
                >
                  Issue Rejection Notice
                </Button>
                <Button
                  variant="primary"
                  icon={<Check size={15} />}
                  onClick={() => handleApprove(selectedApp.id)}
                >
                  Authorize Sanction
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-navy-900">{selectedApp.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Location: {selectedApp.entity}</p>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <h5 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2.5">
                Rule Engine Scrutiny Checks (NBC 2016)
              </h5>
              <div className="space-y-2">
                {selectedApp.violations?.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-primary-700 mr-2">{v.code}</span>
                      <span className="font-semibold text-navy-900">{v.rule}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Measured: <strong className="text-navy-900">{v.actual}</strong> &bull;
                        Requirement: {v.required}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.severity === 'Compliant'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {v.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OfficerDashboard;
