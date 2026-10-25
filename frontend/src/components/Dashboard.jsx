import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store';
import {
  FileUp,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Building2,
  ClipboardCheck,
  Award,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'upload' | 'view' | null
  const [selectedApp, setSelectedApp] = useState(null);

  // Helper mock records when backend /api/applications is not yet implemented
  const getMockApplications = (role) => {
    const r = role?.toLowerCase();
    if (r === 'officer') {
      return [
        {
          id: 'APP-2026-1044',
          citizen_name: 'Ravi',
          project_name: 'Commercial Complex Phase-2',
          plot: 'Plot 45B, Okhla Ind. Area',
          status: 'pending',
          flag: 'BL-001: Rear Setback (2.2m < 3.0m)',
          date: '24 Oct 2026',
        },
        {
          id: 'APP-2026-1102',
          citizen_name: 'Vikram Sharma',
          project_name: 'Mixed-Use Retail & Apartments',
          plot: 'Sector 22, Rohini',
          status: 'in_review',
          flag: 'BL-002: Ground Coverage (53% > 50%)',
          date: '23 Oct 2026',
        },
        {
          id: 'APP-2026-0988',
          citizen_name: 'Ananya Roy',
          project_name: 'Industrial Logistics Hub',
          plot: 'Narela Phase 1',
          status: 'pending',
          flag: 'Awaiting Officer Signoff',
          date: '22 Oct 2026',
        },
      ];
    }

    if (r === 'admin') {
      return [
        {
          id: 'APP-2026-1044',
          citizen_name: 'Ravi',
          officer_name: 'Priya',
          project_name: 'Commercial Complex Phase-2',
          status: 'pending',
          recommendation: 'Recommend Rejection (BL-001 Rear Setback)',
          date: '24 Oct 2026',
        },
        {
          id: 'APP-2026-0912',
          citizen_name: 'Meera Patel',
          officer_name: 'Priya',
          project_name: 'Eco-Living Villa Complex',
          status: 'pending',
          recommendation: 'Recommended for Final Clearance',
          date: '21 Oct 2026',
        },
        {
          id: 'APP-2026-0891',
          citizen_name: 'Ravi',
          officer_name: 'Priya',
          project_name: 'Residential Villa (G+2)',
          status: 'approved',
          recommendation: 'Digital Seal & QR Issued',
          date: '18 Oct 2026',
        },
      ];
    }

    // Default: Citizen
    return [
      {
        id: 'APP-2026-1044',
        project_name: 'Commercial Complex Phase-2',
        plot: 'Plot 45B, Okhla Ind. Area',
        status: 'pending',
        date: '24 Oct 2026',
        pdf_name: 'naksha_commercial_rev2.pdf',
      },
      {
        id: 'APP-2026-0891',
        project_name: 'Residential Villa (G+2)',
        plot: 'Plot 12, Sector 14, Dwarka',
        status: 'approved',
        date: '18 Oct 2026',
        pdf_name: 'dwarka_villa_final.pdf',
      },
      {
        id: 'APP-2026-0730',
        project_name: 'Office Warehouse Annex',
        plot: 'Plot 7, Narela',
        status: 'rejected',
        date: '12 Oct 2026',
        pdf_name: 'narela_warehouse.pdf',
      },
    ];
  };

  useEffect(() => {
    let isMounted = true;
    const fetchApplications = async () => {
      if (!currentUser?.id) return;
      setLoading(true);

      try {
        const response = await axios.get(
          `http://localhost:8000/api/applications?user_id=${currentUser.id}&role=${currentUser.role}`
        );
        if (isMounted && response.data && Array.isArray(response.data)) {
          setApplications(response.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn(
          'Backend /api/applications not reachable or not yet implemented. Using mock queue data:',
          err.message
        );
      }

      if (isMounted) {
        setApplications(getMockApplications(currentUser.role));
        setLoading(false);
      }
    };

    fetchApplications();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            In Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Pending Scrutiny
          </span>
        );
    }
  };

  const currentRole = currentUser?.role?.toLowerCase() || 'citizen';

  return (
    <div className="py-8">
      {/* Role Header Banner */}
      <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                Active View
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {currentRole === 'citizen' && 'Citizen Self-Service Portal'}
                {currentRole === 'officer' && 'Town Planning Officer Scrutiny Console'}
                {currentRole === 'admin' && 'Chief Town Planner Approval Dashboard'}
              </h1>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl">
              {currentRole === 'citizen' &&
                'Upload architectural Naksha drawings (PDF), trigger instant automated bye-law analysis, and check clearance status.'}
              {currentRole === 'officer' &&
                'Review Gemini-extracted plan metrics, evaluate deterministic rule checks, and inspect regulatory clauses via TinyFish.'}
              {currentRole === 'admin' &&
                'Examine officer recommendations, audit compliance trails, and issue final digitally sealed building permits.'}
            </p>
          </div>

          {/* Citizen Primary CTA: Upload Naksha */}
          {currentRole === 'citizen' && (
            <div>
              <button
                type="button"
                onClick={() => setActiveModal('upload')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 text-white font-medium text-sm shadow-md hover:from-sky-500 hover:to-emerald-500 transition-all hover:shadow-lg active:scale-95"
              >
                <FileUp className="w-4 h-4" />
                <span>Upload Naksha (PDF)</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {currentRole === 'citizen' ? 'My Submissions' : 'Queue Count'}
              </span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{applications.length}</p>
          </div>

          <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-800">
                {currentRole === 'admin' ? 'Awaiting Final Seal' : 'Pending Scrutiny'}
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-amber-900 mt-1">
              {applications.filter((a) => a.status === 'pending' || a.status === 'in_review').length}
            </p>
          </div>

          <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800">Approved Permits</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-900 mt-1">
              {applications.filter((a) => a.status === 'approved').length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentRole === 'citizen' && <FileText className="w-5 h-5 text-sky-600" />}
            {currentRole === 'officer' && <ClipboardCheck className="w-5 h-5 text-sky-600" />}
            {currentRole === 'admin' && <Award className="w-5 h-5 text-purple-600" />}
            <h2 className="font-bold text-base text-slate-900">
              {currentRole === 'citizen' && 'My Submitted Naksha Applications'}
              {currentRole === 'officer' && 'Officer Scrutiny Queue'}
              {currentRole === 'admin' && 'Admin Final Approval Queue'}
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Logged in as <strong className="text-slate-700">{currentUser?.name}</strong>
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-sky-600" />
            <p className="text-sm text-slate-500 mt-3">Loading application queue...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No applications found</p>
            <p className="text-xs text-slate-400 mt-1">
              {currentRole === 'citizen'
                ? 'Click "Upload Naksha (PDF)" to submit your first architectural plan.'
                : 'No plans currently pending review in your queue.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-6">Application ID</th>
                  {currentRole !== 'citizen' && <th className="py-3 px-6">Applicant</th>}
                  <th className="py-3 px-6">Project / Details</th>
                  {currentRole === 'officer' && <th className="py-3 px-6">Rule Scrutiny Flag</th>}
                  {currentRole === 'admin' && <th className="py-3 px-6">Officer Recommendation</th>}
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Submission Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Application ID */}
                    <td className="py-4 px-6 font-mono font-semibold text-slate-900">
                      <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {app.id}
                      </span>
                    </td>

                    {/* Applicant (For Officer & Admin) */}
                    {currentRole !== 'citizen' && (
                      <td className="py-4 px-6 text-slate-800 font-medium">
                        {app.citizen_name || 'Ravi'}
                      </td>
                    )}

                    {/* Project / Plot Details */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{app.project_name || 'Building Plan'}</div>
                      <div className="text-xs text-slate-400">{app.plot || 'City Zone Plan'}</div>
                    </td>

                    {/* Officer Flag */}
                    {currentRole === 'officer' && (
                      <td className="py-4 px-6">
                        <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200 inline-block">
                          {app.flag || '1 Rule Flagged'}
                        </span>
                      </td>
                    )}

                    {/* Admin Recommendation */}
                    {currentRole === 'admin' && (
                      <td className="py-4 px-6">
                        <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200 inline-block">
                          {app.recommendation || 'Scrutiny Completed'}
                        </span>
                      </td>
                    )}

                    {/* Status Badge */}
                    <td className="py-4 px-6">{renderStatusBadge(app.status)}</td>

                    {/* Date */}
                    <td className="py-4 px-6 text-xs text-slate-500">{app.date || 'Today'}</td>

                    {/* View Button Placeholder */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          setActiveModal('view');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Placeholder Feedback Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                {activeModal === 'upload' ? (
                  <FileUp className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {activeModal === 'upload'
                    ? 'Upload Naksha (PDF)'
                    : `Viewing ${selectedApp?.id || 'Application'}`}
                </h3>
                <p className="text-xs text-slate-400">NakshaNetra GovTech Engine</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs text-slate-600 space-y-2 mb-6">
              {activeModal === 'upload' ? (
                <>
                  <p className="font-semibold text-slate-800">
                    PDF Upload Pipeline (Coming in Next Stage):
                  </p>
                  <p>
                    In the next stage, this trigger will connect to the Gemini 1.5 Multimodal PDF
                    extractor to automatically detect setbacks, plot coverage, and floor area ratios.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-800">
                    Scrutiny Inspector & Drawing Viewer:
                  </p>
                  <p>
                    Application <strong className="text-slate-900">{selectedApp?.id}</strong> is
                    currently in state <strong className="text-sky-700">{selectedApp?.status}</strong>.
                  </p>
                  <p>
                    The split-view drawing viewer with bounding boxes and TinyFish regulatory citations
                    will be rendered here.
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setSelectedApp(null);
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
