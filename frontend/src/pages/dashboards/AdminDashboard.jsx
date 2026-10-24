import React, { useState } from 'react';
import {
  Activity,
  ShieldAlert,
  Cpu,
  Database,
  Users,
  CheckCircle,
  FileCheck,
  Building,
  Server,
  Zap,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const AdminDashboard = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);

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
            computer-vision inferences, National Building Code (NBC) rule evaluations, and zonal
            officer processing throughput in real-time.
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
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Compliance Rate
            </p>
            <h3 className="text-2xl font-black text-navy-900 mt-0.5">78.4%</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">First-time approval</p>
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
          onExportRow={(row) =>
            alert(`Generating Full System Trace for Audit Event ${row.id}...`)
          }
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
