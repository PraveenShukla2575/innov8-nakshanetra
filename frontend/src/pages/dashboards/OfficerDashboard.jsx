import React, { useState } from 'react';
import axios from 'axios';
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
  ExternalLink,
  BookOpen,
  UserCheck,
  Award,
  Loader2,
  Search,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { generateScrutinyPDF } from '../../lib/pdfGenerator';
import { ArchitectVerificationPanel } from '../../components/scanner/ArchitectVerificationPanel';
import { useAuth } from '../../context/AuthContext';

const mockArchitects = [
  { name: "Sunita Reddy", reg: "CA/2018/91234" }, 
  { name: "Vikram Singh", reg: "CA/2012/55432" }, 
  { name: "Priya Desai", reg: "CA/2020/12345" }, 
  { name: "Arjun Nair", reg: "CA/2016/88776" }
];

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const [selectedApp, setSelectedApp] = useState(null);
  const [verifyingCode, setVerifyingCode] = useState(null);
  const [ruleCitations, setRuleCitations] = useState({});

  const handleVerifyRule = async (ruleCode, parameterName) => {
    setVerifyingCode(ruleCode);
    const API_BASE = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`;
    try {
      const response = await axios.post(`${API_BASE}/api/rules/verify-source`, {
        rule_code: ruleCode,
        parameter: parameterName,
      });
      setRuleCitations((prev) => ({
        ...prev,
        [ruleCode]: response.data,
      }));
    } catch (err) {
      console.error('Failed to verify official rule:', err);
      setRuleCitations((prev) => ({
        ...prev,
        [ruleCode]: {
          citation: `System Note: Could not reach live registry. Fallback standard for ${parameterName} applied.`,
          url: '#',
        },
      }));
    } finally {
      setVerifyingCode(null);
    }
  };

  const [applications, setApplications] = useState([
    {
      id: 'APP-2026-1044',
      timestamp: '2026-10-24T09:45:00Z',
      title: 'Commercial Complex Phase-2 (G+4)',
      category: 'Commercial Complex',
      entity: 'Okhla Ind. Area, Plot 45B',
      architect_name: 'Rahul Verma',
      reg_number: 'CA/2015/64321',
      status: 'PENDING',
      officer: 'Priya Sharma (You)',
      penalty_score: 50,
      scrutinyReport: {
        penalty_score: 50,
      },
      violations: [
        { code: 'BL-001', rule: 'Rear Setback Distance', actual: '2.20 m', required: 'Min 3.00 m', severity: 'Deficient', passed: false },
        { code: 'BL-004', rule: 'Emergency Fire Exit Staircase Width', actual: '1.50 m', required: 'Min 1.50 m', severity: 'Compliant', passed: true },
      ],
    },
    {
      id: 'APP-2026-1102',
      timestamp: '2026-10-23T16:20:00Z',
      title: 'Mixed-Use Retail & Residential (G+3)',
      category: 'Mixed-Use',
      entity: 'Sector 22, Rohini, Plot 18',
      architect_name: 'Sunita Rao',
      reg_number: 'CA/2018/78210',
      status: 'FLAGGED',
      officer: 'Priya Sharma (You)',
      penalty_score: 50,
      scrutinyReport: {
        penalty_score: 50,
      },
      violations: [
        { code: 'BL-002', rule: 'Ground Coverage Ratio', actual: '53.2%', required: 'Max 50.0%', severity: 'Excessive', passed: false },
        { code: 'BL-003', rule: 'Floor Area Ratio (FAR)', actual: '198', required: 'Max 200', severity: 'Compliant', passed: true },
      ],
    },
    {
      id: 'APP-2026-0988',
      timestamp: '2026-10-22T11:10:00Z',
      title: 'Industrial Logistics Hub & Depot',
      category: 'Industrial',
      entity: 'Narela Phase 1, Shed 4',
      architect_name: 'Vikramaditya Seth',
      reg_number: 'CA/2012/54019',
      status: 'PENDING',
      officer: 'Priya Sharma (You)',
      penalty_score: 0,
      scrutinyReport: {
        penalty_score: 0,
      },
      violations: [
        { code: 'BL-005', rule: 'Front Road Right of Way (ROW)', actual: '18.0 m', required: 'Min 18.0 m', severity: 'Compliant', passed: true },
      ],
    },
    {
      id: 'APP-2026-0912',
      timestamp: '2026-10-21T14:30:00Z',
      title: 'Eco-Living Villa Complex (G+2)',
      category: 'Residential - Plotted',
      entity: 'Sector 14, Dwarka, Plot 89',
      architect_name: 'Ananya Roy',
      reg_number: 'CA/2019/88124',
      status: 'APPROVED',
      officer: 'Priya Sharma (You)',
      penalty_score: 0,
      scrutinyReport: {
        penalty_score: 0,
      },
      violations: [
        { code: 'BL-ALL', rule: 'All NBC 2016 Bye-Laws', actual: '100% Pass', required: 'Pass', severity: 'Compliant', passed: true },
      ],
    },
    {
      id: 'APP-2026-0730',
      timestamp: '2026-10-19T10:00:00Z',
      title: 'Packaging Distribution Centre',
      category: 'Industrial & Warehouse',
      entity: 'Bawana Industrial Estate',
      architect_name: 'Devendra Nath',
      reg_number: 'CA/2014/43110',
      status: 'REJECTED',
      officer: 'Priya Sharma (You)',
      penalty_score: 100,
      scrutinyReport: {
        penalty_score: 100,
      },
      violations: [
        { code: 'BL-007', rule: 'Hazardous Chemical Buffer Zone', actual: '5.0 m', required: 'Min 12.0 m', severity: 'Critical Hazard', passed: false },
        { code: 'BL-001', rule: 'Rear Setback Distance', actual: '2.10 m', required: 'Min 4.00 m', severity: 'Deficient', passed: false },
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

  const applicationData = selectedApp;

  return (
    <div className="space-y-8 pb-10">
      {/* Officer Station Hero Banner (Navy/Indigo) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-primary-800 to-navy-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 border border-primary-400/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} />
            Field Scrutiny Enforcement Wing{user?.full_name ? ` • Officer: ${user.full_name}` : ''}
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
          onViewDetails={(row) => {
            const randomArchitect =
              mockArchitects[Math.floor(Math.random() * mockArchitects.length)] || {
                name: 'Sunita Reddy',
                reg: 'CA/2018/91234',
              };
            setSelectedApp({
              ...row,
              architect_name: randomArchitect.name,
              reg_number: randomArchitect.reg,
              name: randomArchitect.name,
              reg: randomArchitect.reg,
            });
          }}
          onExportRow={(row) => {
            const evaluations = row.violations?.map((v) => ({
              rule_code: v.code,
              title: v.rule,
              actual: v.actual,
              expected: v.required,
              passed: v.severity === 'Compliant',
              status: v.severity === 'Compliant' ? 'PASSED' : 'VIOLATION',
            }));
            generateScrutinyPDF(row, { evaluations });
          }}
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

            {/* Step 1: Dedicated Pre-Scrutiny Architect & RERA Background Check */}
            <ArchitectVerificationPanel applicationData={selectedApp} />

            {/* Application Status Banner (Green / Red / Amber) */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                selectedApp.status === 'APPROVED'
                  ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border-emerald-500/40'
                  : selectedApp.status === 'REJECTED'
                  ? 'bg-gradient-to-r from-red-950 via-rose-900 to-red-900 border-red-500/40'
                  : 'bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-900 border-amber-500/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md shrink-0">
                  {selectedApp.status === 'APPROVED' ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : selectedApp.status === 'REJECTED' ? (
                    <X size={20} className="text-red-400" />
                  ) : (
                    <AlertTriangle size={20} className="text-amber-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold tracking-tight">
                    {selectedApp.status === 'APPROVED'
                      ? 'APPLICATION STATUS: SANCTION CLEARED'
                      : selectedApp.status === 'REJECTED'
                      ? 'APPLICATION STATUS: STATUTORY DEFICIENCIES FLAGGED'
                      : 'APPLICATION STATUS: PENDING OFFICER FIELD SCRUTINY'}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Application ID: {selectedApp.id} &bull; Zone: {selectedApp.entity}
                  </p>
                </div>
              </div>
              <StatusBadge status={selectedApp.status} size="sm" />
            </div>

            {/* Unified Bye-Law Verification Grid */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2.5">
                <h5 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Unified Bye-Law Verification Grid (NBC 2016 & UBBL)
                </h5>
                <span className="text-[11px] text-slate-500">Live Scraper Verification Enabled</span>
              </div>
              <div className="space-y-3">
                {selectedApp.violations?.map((v, i) => {
                  const citationData = ruleCitations[v.code];
                  const isVerifying = verifyingCode === v.code;
                  return (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-xs space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-200 text-[11px]">
                              {v.code}
                            </span>
                            <span className="font-semibold text-navy-900 text-sm">{v.rule}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Measured: <strong className="text-navy-900">{v.actual}</strong> &bull;
                            Requirement: <span className="font-medium text-slate-700">{v.required}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.severity === 'Compliant'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {v.severity}
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={isVerifying}
                            icon={!isVerifying ? <ShieldCheck size={13} className="text-primary-600" /> : null}
                            onClick={() => handleVerifyRule(v.code, v.rule)}
                            className="text-xs py-1 px-2.5 h-7"
                          >
                            {isVerifying ? 'Verifying...' : citationData ? 'Re-verify' : 'Verify Official Rule'}
                          </Button>
                        </div>
                      </div>

                      {/* Display scraped citation & verifiable URL if verified */}
                      {citationData && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/90 text-[11px] space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-navy-900">
                            <BookOpen size={13} className="text-primary-600 shrink-0" />
                            <span>Statutory Regulatory Verification</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed font-sans">
                            {citationData.citation}
                          </p>
                          {citationData.url && citationData.url !== '#' && (
                            <div className="pt-0.5">
                              <a
                                href={citationData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-800 hover:underline"
                              >
                                <span>View Official Bye-Law Source</span>
                                <ExternalLink size={11} />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OfficerDashboard;
