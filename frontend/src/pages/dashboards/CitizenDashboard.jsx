import React, { useState } from 'react';
import {
  FileCheck2,
  FileClock,
  AlertCircle,
  ShieldCheck,
  Building,
  ArrowUpRight,
  Info,
  CheckCircle2,
  XCircle,
  Cpu,
  Gauge,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  RefreshCw,
  FileEdit,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UploadZone } from '../../components/scanner/UploadZone';
import { generateScrutinyPDF } from '../../lib/pdfGenerator';
import { ArchitectVerificationPanel } from '../../components/scanner/ArchitectVerificationPanel';
import { mockArchitects } from './OfficerDashboard';

export const CitizenDashboard = () => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeReport, setActiveReport] = useState(null); // Real-time Scrutiny Report from Gemini + Rule Engine
  const [submissions, setSubmissions] = useState([
    {
      id: 'APP-2026-1044',
      timestamp: '2026-10-24T10:30:00Z',
      title: 'Commercial Complex Phase-2 (G+4)',
      category: 'Commercial Complex',
      entity: 'Okhla Industrial Area, Plot 45B',
      status: 'PENDING',
      officer: 'Priya Sharma (Zone IV)',
      remarks: 'Setback clearance verification underway.',
    },
    {
      id: 'APP-2026-0891',
      timestamp: '2026-10-18T14:15:00Z',
      title: 'Residential Villa Sanction Plan (G+2)',
      category: 'Residential - Plotted',
      entity: 'Sector 14, Dwarka, Plot 12',
      status: 'APPROVED',
      officer: 'Sanjay Rawat (Zone II)',
      remarks: 'All NBC 2016 bye-laws satisfied. Digital sanction QR generated.',
    },
    {
      id: 'APP-2026-0730',
      timestamp: '2026-10-12T09:00:00Z',
      title: 'Office Warehouse Annex Expansion',
      category: 'Industrial & Warehouse',
      entity: 'Narela Phase 1, Plot 7',
      status: 'REJECTED',
      officer: 'Priya Sharma (Zone IV)',
      remarks: 'Deficiency: Ground coverage exceeds 50% threshold limit.',
    },
  ]);

  // Callback from UploadZone when actual backend analysis completes
  const handleScrutinyComplete = (payload) => {
    const { application, category, trackingId, zone, uploadedFileName } = payload;
    const scrutinyData = application.scrutiny_reports?.[0] || {};
    const rawJson = scrutinyData.gemini_raw_json || {};
    const overallStatus = application.status || rawJson.overall_status || 'PENDING';

    const randomArchitect = mockArchitects[Math.floor(Math.random() * mockArchitects.length)];
    const reportObj = {
      appId: trackingId || `APP-2026-${application.id}`,
      databaseId: application.id,
      fileName: uploadedFileName,
      status: overallStatus,
      category: category,
      zone: zone,
      pdfUrl: application.pdf_url,
      summary: rawJson.summary || 'Architectural compliance check executed.',
      riskScore: rawJson.risk_score ?? 0,
      modelUsed: rawJson.raw_model || 'gemini-3.5-flash',
      rearSetback: rawJson.rear_setback_meters,
      groundCoverage: rawJson.ground_coverage_percent,
      evaluations: rawJson.evaluations || scrutinyData.rule_violations || [],
      timestamp: new Date().toISOString(),
      architect_name: randomArchitect.name,
      reg_number: randomArchitect.reg,
      name: randomArchitect.name,
      reg: randomArchitect.reg,
    };

    setActiveReport(reportObj);

    // Append to citizen history table
    const newSubmissionRow = {
      id: reportObj.appId,
      timestamp: reportObj.timestamp,
      title: uploadedFileName,
      category: category,
      entity: zone,
      status: overallStatus,
      officer: 'Automated AI Scrutiny Engine',
      remarks: reportObj.summary,
      reportData: reportObj,
    };
    setSubmissions((prev) => [newSubmissionRow, ...prev]);

    // Scroll to scrutiny report view
    setTimeout(() => {
      document.getElementById('scrutiny-report-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Banner (Emerald GovTech Theme) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-navy-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} />
            Public Civic Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Automated Building Bye-Law Scrutiny
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200 leading-relaxed">
            Verify architectural drawings against the National Building Code (NBC 2016) and Unified
            Building Bye-Laws using Gemini Multimodal AI and deterministic rule verification.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#upload-section"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-500/20"
            >
              Upload New Naksha
              <ArrowUpRight size={15} />
            </a>
            <button
              onClick={() => {
                const elem = document.getElementById('history-section');
                elem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              Track Existing Applications
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <FileClock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Submissions
            </p>
            <h3 className="text-2xl font-black text-navy-900 mt-0.5">{submissions.length}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Active & verified plans</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileCheck2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sanctioned / Compliant
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">
              {submissions.filter((s) => s.status === 'APPROVED' || s.status === 'COMPLIANT').length}
            </h3>
            <p className="text-[11px] text-emerald-600/80 mt-0.5">Ready for municipal seal</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Violations / Rejected
            </p>
            <h3 className="text-2xl font-black text-red-600 mt-0.5">
              {submissions.filter((s) => s.status === 'REJECTED' || s.status === 'NON_COMPLIANT').length}
            </h3>
            <p className="text-[11px] text-red-600/80 mt-0.5">Requires architectural revision</p>
          </div>
        </Card>
      </div>

      {/* Upload Zone Section */}
      <div id="upload-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building size={20} className="text-navy-900" />
            <h2 className="text-lg font-bold text-navy-900">Step 1: Upload Architectural Plan</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">Supports PDF, JPG & PNG</span>
        </div>
        <UploadZone onScrutinyComplete={handleScrutinyComplete} />
      </div>

      {/* REAL-TIME SCRUTINY REPORT SECTION (Rendered upon Backend Response) */}
      {activeReport && (
        <div id="scrutiny-report-section" className="space-y-4 fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-primary-600" />
              <h2 className="text-lg font-bold text-navy-900">
                AI Architectural Scrutiny Report - {activeReport.appId}
              </h2>
            </div>
            <button
              onClick={() => setActiveReport(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Dismiss Report
            </button>
          </div>

          {/* Pre-Scrutiny Architect & RERA Background Check Panel */}
          <ArchitectVerificationPanel applicationData={activeReport} />

          {/* Master Status Card */}
          <div
            className={`rounded-2xl p-6 border shadow-sm ${
              activeReport.status === 'APPROVED'
                ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white border-emerald-500/40'
                : activeReport.status === 'REJECTED'
                ? 'bg-gradient-to-r from-red-950 via-rose-900 to-red-900 text-white border-red-500/40'
                : 'bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-900 text-white border-amber-500/40'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md">
                  {activeReport.status === 'APPROVED' ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-emerald-300">Statutory Compliance Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="text-red-400" />
                      <span className="text-red-300">Statutory Bye-Law Violations Detected</span>
                    </>
                  )}
                </div>
                <h3 className="text-2xl font-black tracking-tight mt-1">
                  {activeReport.status === 'APPROVED'
                    ? 'APPLICATION APPROVED: READY FOR DIGITAL SANCTION'
                    : 'APPLICATION REJECTED: ARCHITECTURAL MODIFICATIONS REQUIRED'}
                </h3>
                <p className="text-sm text-slate-200">{activeReport.summary}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center shrink-0">
                  <span className="text-[10px] uppercase font-semibold text-slate-300 block">
                    Penalty / Risk Index
                  </span>
                  <span className="text-xl font-black mt-0.5 block">
                    {activeReport.riskScore} <span className="text-xs font-normal">/ 100</span>
                  </span>
                </div>
                {activeReport.status === 'APPROVED' ? (
                  <Button
                    size="md"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    icon={<Download size={16} />}
                    onClick={() => generateScrutinyPDF(activeReport, activeReport)}
                  >
                    Sanction Certificate
                  </Button>
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-white text-red-950 font-bold px-5 py-2.5 rounded-lg shadow-sm hover:bg-slate-100 transition-all border border-red-200"
                    onClick={() => {
                      alert("Revision portal opening...");
                      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <RefreshCw size={16} className="text-red-950" />
                    <span>Revise and Resubmit</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Extracted Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="md" className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Rear Setback Buffer
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-navy-900">
                  {activeReport.rearSetback != null ? `${activeReport.rearSetback} m` : 'Not Found'}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    activeReport.rearSetback != null && activeReport.rearSetback >= 3.0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {activeReport.rearSetback != null && activeReport.rearSetback >= 3.0
                    ? '>= 3.0m (Pass)'
                    : '< 3.0m (Fail)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Rule BL-001 standard: Min 3.0m</p>
            </Card>

            <Card padding="md" className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Ground Coverage
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-navy-900">
                  {activeReport.groundCoverage != null ? `${activeReport.groundCoverage}%` : 'Not Found'}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    activeReport.groundCoverage != null && activeReport.groundCoverage <= 50.0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {activeReport.groundCoverage != null && activeReport.groundCoverage <= 50.0
                    ? '<= 50% (Pass)'
                    : '> 50% (Fail)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Rule BL-002 standard: Max 50.0%</p>
            </Card>

            <Card padding="md" className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Vision AI Engine
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Cpu size={18} className="text-primary-600" />
                <span className="text-base font-bold text-navy-900">{activeReport.modelUsed}</span>
              </div>
              <p className="text-[11px] text-slate-400">Multimodal architectural OCR & reasoning</p>
            </Card>

            <Card padding="md" className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Uploaded Blueprint
              </span>
              <p className="text-sm font-bold text-navy-900 truncate mt-1" title={activeReport.fileName}>
                {activeReport.fileName}
              </p>
              <a
                href={`http://localhost:8000${activeReport.pdfUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
              >
                Inspect stored asset <ExternalLink size={11} />
              </a>
            </Card>
          </div>

          {/* Rule Evaluation Breakdown Cards */}
          <Card padding="md">
            <h4 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary-600" />
              Unified Bye-Law Verification Items ({activeReport.evaluations.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeReport.evaluations.map((ev, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    ev.passed
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-red-50/40 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-white font-mono text-[11px] font-bold text-navy-900 border border-slate-200">
                          {ev.rule_code}
                        </span>
                        <h5 className="text-xs font-bold text-navy-900">{ev.title || ev.parameter}</h5>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{ev.details}</p>
                    </div>
                    <StatusBadge status={ev.status || (ev.passed ? 'PASSED' : 'VIOLATION')} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 font-medium">
                    <span className="text-slate-500">
                      Measured Dimension: <strong className="text-navy-900">{ev.actual}</strong>
                    </span>
                    <span className="text-slate-500">
                      Required Threshold: <strong className="text-navy-900">{ev.expected}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Submissions Data Table */}
      <div id="history-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900">Step 2: Track Past Naksha Submissions</h2>
          <span className="text-xs text-slate-500">Real-time status updates</span>
        </div>
        <DataTable
          title="Citizen Submission History"
          data={submissions}
          onViewDetails={(row) => {
            const randomArchitect = mockArchitects[Math.floor(Math.random() * mockArchitects.length)];
            setSelectedSubmission({
              ...row,
              architect_name: row.architect_name || randomArchitect.name,
              reg_number: row.reg_number || randomArchitect.reg,
              name: row.name || randomArchitect.name,
              reg: row.reg || randomArchitect.reg,
            });
          }}
          onExportRow={(row) => generateScrutinyPDF(row, row.reportData)}
        />
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          title={`Application Details - ${selectedSubmission.id}`}
          footer={
            <Button variant="secondary" onClick={() => setSelectedSubmission(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-navy-900">{selectedSubmission.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSubmission.entity}</p>
              </div>
              <StatusBadge status={selectedSubmission.status} />
            </div>

            {/* Pre-Scrutiny Architect & RERA Background Check */}
            <ArchitectVerificationPanel applicationData={selectedSubmission} />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-slate-400 block font-medium">Category</span>
                <span className="font-semibold text-navy-900 mt-0.5 block">
                  {selectedSubmission.category}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-slate-400 block font-medium">Assigned Officer</span>
                <span className="font-semibold text-navy-900 mt-0.5 block">
                  {selectedSubmission.officer}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-primary-50/60 border border-primary-100 text-xs text-navy-800">
              <span className="font-bold flex items-center gap-1.5 text-primary-800 mb-1">
                <Info size={14} />
                Compliance Remarks
              </span>
              <p>{selectedSubmission.remarks || 'Scrutiny engine verification pending.'}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CitizenDashboard;
