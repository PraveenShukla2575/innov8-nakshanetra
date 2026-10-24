import React, { useState } from 'react';
import {
  FileCheck2,
  FileClock,
  AlertCircle,
  ShieldCheck,
  Building,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UploadZone } from '../../components/scanner/UploadZone';

export const CitizenDashboard = () => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
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
      status: 'NON_COMPLIANT',
      officer: 'Priya Sharma (Zone IV)',
      remarks: 'Deficiency: Ground coverage exceeds 50% threshold limit.',
    },
  ]);

  const handleAnalyze = ({ files, category, trackingId, zone }) => {
    const newSubmission = {
      id: trackingId.trim() || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      title: files[0]?.name || 'Building Plan Scrutiny Submission',
      category: category,
      entity: zone || 'Municipal Jurisdiction Zone',
      status: 'PENDING',
      officer: 'Automated AI Scrutiny Queue',
      remarks: `${files.length} Naksha drawing(s) queued for rule validation.`,
    };
    setSubmissions((prev) => [newSubmission, ...prev]);
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
            Building Bye-Laws before submitting to municipal authorities. Get real-time compliance
            reports and avoid sanction delays.
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
            <p className="text-[11px] text-slate-400 mt-0.5">Active & archived plans</p>
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
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Scrutiny
            </p>
            <h3 className="text-2xl font-black text-amber-600 mt-0.5">
              {submissions.filter((s) => s.status === 'PENDING').length}
            </h3>
            <p className="text-[11px] text-amber-600/80 mt-0.5">Under evaluation</p>
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
          <span className="text-xs font-medium text-slate-500">PDF Sanction Drawings Only</span>
        </div>
        <UploadZone onAnalyze={handleAnalyze} />
      </div>

      {/* Submissions Data Table */}
      <div id="history-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900">Step 2: Track Past Naksha Submissions</h2>
          <span className="text-xs text-slate-500">Real-time status updates</span>
        </div>
        <DataTable
          title="Citizen Submission History"
          data={submissions}
          onViewDetails={(row) => setSelectedSubmission(row)}
          onExportRow={(row) =>
            alert(`Generating Official Compliance Notice for ${row.id}...`)
          }
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
