import React, { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { generateScrutinyPDF } from '../../lib/pdfGenerator';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ShieldCheck, Info, FileDown } from 'lucide-react';
import { ArchitectVerificationPanel } from '../../components/scanner/ArchitectVerificationPanel';

export const ReportsView = ({ role = 'citizen' }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const roleTitleMap = {
    citizen: 'Citizen Architectural Reports & History',
    officer: 'Field Officer Inspection Dossiers & Audit Trails',
    admin: 'National Compliance Engine Scrutiny Reports',
  };

  // Comprehensive mock submissions with pre-populated scrutiny evaluations for PDF export
  const [submissions] = useState([
    {
      id: 'APP-2026-1044',
      timestamp: '2026-10-24T10:30:00Z',
      title: 'Commercial Complex Phase-2 (G+4)',
      category: 'Commercial Complex',
      entity: 'Okhla Industrial Area, Plot 45B',
      status: 'APPROVED',
      officer: 'Priya Sharma (Zone IV)',
      remarks: 'All NBC 2016 building bye-laws satisfied. Digital sanction QR generated.',
      scrutinyReport: {
        summary: 'All NBC 2016 building bye-laws satisfied. Digital sanction QR generated.',
        evaluations: [
          { rule_code: 'BL-001', parameter: 'Rear Setback Buffer', expected: '>= 3.0m', actual: '4.2m', passed: true, status: 'PASSED' },
          { rule_code: 'BL-002', parameter: 'Maximum Ground Coverage', expected: '<= 50.0%', actual: '44.5%', passed: true, status: 'PASSED' },
          { rule_code: 'BL-003', parameter: 'Permissible Building Height', expected: '<= 15.0m', actual: '12.0m', passed: true, status: 'PASSED' },
          { rule_code: 'BL-004', parameter: 'Emergency Fire Staircase Width', expected: '>= 1.50m', actual: '1.50m', passed: true, status: 'PASSED' },
        ],
      },
    },
    {
      id: 'APP-2026-0891',
      timestamp: '2026-10-18T14:15:00Z',
      title: 'Residential Villa Sanction Plan (G+2)',
      category: 'Residential - Plotted',
      entity: 'Sector 14, Dwarka, Plot 12',
      status: 'APPROVED',
      officer: 'Sanjay Rawat (Zone II)',
      remarks: 'All setbacks and ground coverage compliant with Delhi Unified Bye-Laws.',
      penalty_score: 0,
      scrutinyReport: {
        penalty_score: 0,
        summary: 'All setbacks and ground coverage compliant with Delhi Unified Bye-Laws.',
        evaluations: [
          { rule_code: 'BL-001', parameter: 'Rear Setback Buffer', expected: '>= 3.0m', actual: '4.0m', passed: true, status: 'PASSED' },
          { rule_code: 'BL-002', parameter: 'Maximum Ground Coverage', expected: '<= 50.0%', actual: '45.0%', passed: true, status: 'PASSED' },
          { rule_code: 'BL-003', parameter: 'Building Height Limit', expected: '<= 12.0m', actual: '10.0m', passed: true, status: 'PASSED' },
        ],
      },
    },
    {
      id: 'APP-2026-0730',
      timestamp: '2026-10-12T09:00:00Z',
      title: 'Office Warehouse Annex Expansion',
      category: 'Industrial & Warehouse',
      entity: 'Narela Phase 1, Plot 7',
      status: 'REJECTED',
      officer: 'Priya Sharma (Zone IV)',
      remarks: 'Deficiency: Ground coverage (65%) exceeds 50% threshold limit and rear setback is deficient.',
      penalty_score: 100,
      scrutinyReport: {
        penalty_score: 100,
        summary: 'Deficiency: Ground coverage (65%) exceeds 50% threshold limit and rear setback is deficient.',
        evaluations: [
          { rule_code: 'BL-001', parameter: 'Rear Setback Buffer', expected: '>= 3.0m', actual: '2.0m', passed: false, status: 'VIOLATION' },
          { rule_code: 'BL-002', parameter: 'Maximum Ground Coverage', expected: '<= 50.0%', actual: '65.0%', passed: false, status: 'VIOLATION' },
          { rule_code: 'BL-003', parameter: 'Floor Area Ratio (FAR)', expected: '<= 2.00', actual: '1.85', passed: true, status: 'PASSED' },
        ],
      },
    },
    {
      id: 'APP-2026-0988',
      timestamp: '2026-10-22T11:40:00Z',
      title: 'Mixed-Use Retail & Residential Hub',
      category: 'Mixed-Use Commercial',
      entity: 'Sector 22, Rohini, Plot 8',
      status: 'PENDING',
      officer: 'Amit Verma (Enforcement)',
      remarks: 'Automated AI scrutiny complete; awaiting officer field verification signoff.',
      penalty_score: 0,
      scrutinyReport: {
        penalty_score: 0,
        summary: 'Automated AI scrutiny complete; awaiting officer field verification signoff.',
        evaluations: [
          { rule_code: 'BL-001', parameter: 'Rear Setback Buffer', expected: '>= 3.0m', actual: '3.5m', passed: true, status: 'PASSED' },
          { rule_code: 'BL-002', parameter: 'Maximum Ground Coverage', expected: '<= 50.0%', actual: '48.0%', passed: true, status: 'PASSED' },
        ],
      },
    },
    {
      id: 'APP-2026-1215',
      timestamp: '2026-10-23T16:00:00Z',
      title: 'Institutional Educational Annex (G+3)',
      category: 'Institutional / Educational',
      entity: 'Vasant Kunj Institutional Area',
      status: 'APPROVED',
      officer: 'Sanjay Rawat (Zone II)',
      remarks: 'Clearance granted with digital sanction verification seal.',
      penalty_score: 0,
      scrutinyReport: {
        penalty_score: 0,
        summary: 'Clearance granted with digital sanction verification seal.',
        evaluations: [
          { rule_code: 'BL-001', parameter: 'Rear Setback Buffer', expected: '>= 3.0m', actual: '4.5m', passed: true, status: 'PASSED' },
          { rule_code: 'BL-002', parameter: 'Maximum Ground Coverage', expected: '<= 50.0%', actual: '38.0%', passed: true, status: 'PASSED' },
          { rule_code: 'BL-004', parameter: 'Emergency Fire Exit Staircase Width', expected: '>= 1.50m', actual: '1.80m', passed: true, status: 'PASSED' },
        ],
      },
    },
  ]);

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
            My Submissions & Reports
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

      {/* Functional DataTable with instant PDF export */}
      <div className="space-y-3">
        <DataTable
          title="Submission History & Official Notices"
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
          onExportRow={(row) => generateScrutinyPDF(row, row.scrutinyReport)}
        />
      </div>

      {/* Record Inspection Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          title={`Application Details - ${selectedSubmission.id}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                icon={<FileDown size={14} />}
                onClick={() => {
                  generateScrutinyPDF(selectedSubmission, selectedSubmission.scrutinyReport);
                }}
              >
                Download PDF Notice
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedSubmission(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-navy-900">{selectedSubmission.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSubmission.entity}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-center">
                  <span className="text-[9px] uppercase font-semibold text-slate-500 block leading-tight">
                    Penalty / Risk
                  </span>
                  <span className="text-xs font-bold text-navy-900 block leading-tight">
                    {selectedSubmission.status === 'APPROVED'
                      ? 0
                      : (selectedSubmission.scrutinyReport?.penalty_score ??
                         selectedSubmission.penalty_score ??
                         (selectedSubmission.scrutinyReport?.evaluations
                           ? Math.min(
                               100,
                               selectedSubmission.scrutinyReport.evaluations.filter((e) => e.passed === false).length * 50
                             )
                           : 0))}{' '}
                    <span className="text-[10px] font-normal text-slate-400">/ 100</span>
                  </span>
                </div>
                <StatusBadge status={selectedSubmission.status} />
              </div>
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
              <p>{selectedSubmission.remarks || 'Scrutiny engine verification complete.'}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReportsView;
