import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity,
  ShieldAlert,
  Cpu,
  Database,
  Users,
  CheckCircle,
  CheckCircle2,
  FileCheck,
  Building,
  Server,
  Zap,
  UserCheck,
  RefreshCw,
  Mail,
  MapPin,
  Clock,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { generateScrutinyPDF } from '../../lib/pdfGenerator';

export const AdminDashboard = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Pending officer approval states
  const [pendingOfficers, setPendingOfficers] = useState([]);
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [officersError, setOfficersError] = useState(null);
  const [approvalSuccess, setApprovalSuccess] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchPendingOfficers = async () => {
    setLoadingOfficers(true);
    setOfficersError(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/admin/pending-officers`);
      setPendingOfficers(response.data || []);
    } catch (err) {
      setOfficersError(
        err.response?.data?.detail || err.message || 'Failed to fetch pending officers'
      );
    } finally {
      setLoadingOfficers(false);
    }
  };

  useEffect(() => {
    fetchPendingOfficers();
  }, []);

  const handleApproveOfficer = async (userId, fullName) => {
    setApprovingId(userId);
    try {
      await axios.patch(`http://localhost:8000/api/admin/approve-officer/${userId}`);
      setPendingOfficers((prev) => prev.filter((o) => o.id !== userId));
      setApprovalSuccess(
        `Officer ${fullName || '#' + userId} has been approved successfully. They may now log in.`
      );
      setTimeout(() => setApprovalSuccess(null), 6000);
    } catch (err) {
      alert('Approval failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setApprovingId(null);
    }
  };

  const auditRecords = [
    {
      id: 'AUDIT-89012',
      timestamp: '2026-10-24T12:00:00Z',
      title: 'NBC 2016 Rule Engine Batch Execution',
      category: 'System Scrutiny',
      entity: 'National Building Code Engine',
      status: 'COMPLIANT',
      officer: 'Amit Verma (Admin)',
      details: 'Evaluated 48 rules across 12 zonal sanction sets. Zero parser exceptions.',
    },
    {
      id: 'AUDIT-88994',
      timestamp: '2026-10-24T10:15:00Z',
      title: 'Commercial Complex Phase-2 (APP-2026-1044)',
      category: 'Zonal Audit',
      entity: 'South Delhi Municipal Corp',
      status: 'FLAGGED',
      officer: 'Priya Sharma (Officer)',
      details: 'Flagged for BL-001 Rear setback shortfall (2.2m vs 3.0m requirement).',
    },
    {
      id: 'AUDIT-88741',
      timestamp: '2026-10-23T18:40:00Z',
      title: 'High-Density Housing Sanction (APP-2026-0891)',
      category: 'Permit Verification',
      entity: 'Dwarka Development Authority',
      status: 'APPROVED',
      officer: 'Sanjay Rawat (Officer)',
      details: 'Digital Sanction QR Code stamped onto Sanction Document.',
    },
    {
      id: 'AUDIT-88610',
      timestamp: '2026-10-23T14:22:00Z',
      title: 'Industrial Warehouse Buffer Check (APP-2026-0730)',
      category: 'Hazard Regulation',
      entity: 'Narela Industrial Area',
      status: 'REJECTED',
      officer: 'Priya Sharma (Officer)',
      details: 'Rejected under Section 7.4: Hazardous Chemical Buffer zone deficient.',
    },
    {
      id: 'AUDIT-88500',
      timestamp: '2026-10-22T09:05:00Z',
      title: 'Unified Bye-Law DB Table Synchronization',
      category: 'Database Migration',
      entity: 'Supabase PostgreSQL DB',
      status: 'COMPLIANT',
      officer: 'System Daemon',
      details: 'Synchronized 42 building bye-law rules into active scrutiny cache.',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Admin Dark Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-slate-900 to-navy-800 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Server size={14} className="text-primary-400" />
            Root System Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            GovTech Platform Telemetry & Rule Governance
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Centralized oversight of the NakshaNetra automated compliance engine. Monitor AI
            computer-vision inferences, National Building Code (NBC) rule evaluations, and officer
            approval workflows in real-time.
          </p>
        </div>
      </div>

      {/* 4 High-Level System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Audits Run
            </p>
            <h3 className="text-2xl font-black text-navy-900 mt-0.5">1,428</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">&uarr; 14% this week</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Cpu size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rule Engine Status
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">42 Rules</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">100% Parsed & Active</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Officers
            </p>
            <h3 className="text-2xl font-black text-amber-600 mt-0.5">
              {pendingOfficers.length}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting Authorization</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Zap size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Engine Latency
            </p>
            <h3 className="text-2xl font-black text-purple-600 mt-0.5">1.2s</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">FastAPI & Supabase</p>
          </div>
        </Card>
      </div>

      {/* ================================================================= */}
      {/* 2. PENDING OFFICER APPROVALS WORKFLOW SECTION                    */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-navy-900">Pending Officer Approvals</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {pendingOfficers.length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve municipal enforcement officers before granting portal scrutiny access.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPendingOfficers}
            disabled={loadingOfficers}
            className="flex items-center gap-1.5 text-xs self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw size={13} className={loadingOfficers ? 'animate-spin' : ''} />
            <span>Refresh Queue</span>
          </Button>
        </div>

        {/* Approval Success Banner */}
        {approvalSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold leading-tight">Access Granted</p>
              <p className="text-xs text-emerald-800 mt-0.5">{approvalSuccess}</p>
            </div>
            <button
              onClick={() => setApprovalSuccess(null)}
              className="text-emerald-500 hover:text-emerald-700 text-sm font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Fetch Error Banner */}
        {officersError && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-600 shrink-0" />
            <span>{officersError}</span>
          </div>
        )}

        {/* Officers Queue Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loadingOfficers ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
              <Loader2 size={24} className="text-primary-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Fetching pending registrations...</p>
            </div>
          ) : pendingOfficers.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-1">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-sm font-bold text-navy-900">All Officers Verified</h4>
              <p className="text-xs text-slate-500 max-w-md">
                There are currently no officer accounts awaiting administrative approval. When a new
                enforcement officer registers, their verification ticket will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Officer Profile</th>
                    <th className="py-3 px-4">Official Email</th>
                    <th className="py-3 px-4">Municipal Jurisdiction</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Approval Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingOfficers.map((officer) => (
                    <tr key={officer.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                            {(officer.full_name || officer.name || 'O')
                              .split(' ')
                              .filter(Boolean)
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-navy-900 text-xs">
                              {officer.full_name || officer.name}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: #{officer.id} • Role: {officer.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          <span>{officer.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="font-medium">{officer.zone || 'Delhi (MCD)'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={11} />
                          Pending Review
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleApproveOfficer(officer.id, officer.full_name || officer.name)
                          }
                          disabled={approvingId === officer.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer"
                        >
                          {approvingId === officer.id ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Approving...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle size={13} />
                              <span>Approve Officer</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Overview Telemetry Data Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-navy-900" />
            <h2 className="text-lg font-bold text-navy-900">Nationwide Scrutiny Audit Log</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">Live Telemetry Feed</span>
        </div>

        <DataTable
          title="System Audit & Enforcement Log"
          data={auditRecords}
          onViewDetails={(row) => setSelectedRecord(row)}
          onExportRow={(row) => generateScrutinyPDF(row)}
        />
      </div>

      {/* Audit Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Audit Record: ${selectedRecord.id}`}
          footer={
            <Button variant="secondary" onClick={() => setSelectedRecord(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-navy-900">{selectedRecord.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedRecord.entity}</p>
              </div>
              <StatusBadge status={selectedRecord.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-slate-400 block font-medium">Logged By</span>
                <span className="font-semibold text-navy-900 mt-0.5 block">
                  {selectedRecord.officer}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="text-slate-400 block font-medium">Category</span>
                <span className="font-semibold text-navy-900 mt-0.5 block">
                  {selectedRecord.category}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs">
              <span className="font-mono text-primary-400 block mb-1 uppercase text-[10px] tracking-wider">
                Telemetry Log Output
              </span>
              <p className="font-mono text-slate-300">{selectedRecord.details}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
