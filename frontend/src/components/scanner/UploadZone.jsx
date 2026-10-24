import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  FileText,
  Barcode,
  MapPin,
  Building2,
  ScanLine,
  FileUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const CATEGORY_OPTIONS = [
  'Residential - Plotted Housing',
  'Commercial Complex',
  'Industrial & Warehouse Hub',
  'Institutional / Educational',
  'Mixed-Use Commercial & Residential',
];

const PLAN_TYPE_OPTIONS = [
  'Architectural Layout (Ground Floor)',
  'Elevation & Cross Section',
  'Site Plan & Setback Drawing',
  'Full Structural / Sanction Set',
];

export const UploadZone = ({ onAnalyze = () => {} }) => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [trackingId, setTrackingId] = useState('');
  const [zone, setZone] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList);
      const validPdfs = files.filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );

      if (validPdfs.length === 0) {
        setError('Please upload valid building plan PDF files (.pdf).');
        return;
      }

      // Check size limit (15MB)
      const oversized = validPdfs.find((f) => f.size > MAX_FILE_SIZE);
      if (oversized) {
        setError(`"${oversized.name}" exceeds the 15MB limit. Please upload files under 15MB.`);
        return;
      }

      const remaining = MAX_FILES - pdfFiles.length;
      if (remaining <= 0) {
        setError(`Maximum ${MAX_FILES} Naksha PDFs allowed per submission.`);
        return;
      }

      const toAdd = validPdfs.slice(0, remaining).map((file, i) => ({
        id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        planType: PLAN_TYPE_OPTIONS[(pdfFiles.length + i) % PLAN_TYPE_OPTIONS.length],
      }));

      setPdfFiles((prev) => [...prev, ...toAdd]);
      setError(null);
    },
    [pdfFiles.length]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const removePdf = (id) => {
    setPdfFiles((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePlanType = (id, planType) => {
    setPdfFiles((prev) =>
      prev.map((pdf) => (pdf.id === id ? { ...pdf, planType } : pdf))
    );
  };

  const handleSubmit = () => {
    if (pdfFiles.length === 0) return;
    onAnalyze({ files: pdfFiles, category, trackingId, zone });
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Upload Zone Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600">
          <FileUp size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-navy-900">Upload Building Plan (Naksha)</h2>
          <p className="text-xs text-slate-500">
            Upload Naksha PDF (Max 15MB) for automated bye-law compliance evaluation
          </p>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <Card padding="none">
        <div
          id="drop-zone"
          className={`
            relative flex flex-col items-center justify-center
            border-2 border-dashed rounded-xl cursor-pointer
            transition-all duration-200 p-10 overflow-hidden
            ${
              dragActive
                ? 'drop-zone-active'
                : 'border-slate-300 hover:border-primary-400 hover:bg-primary-50/30'
            }
            ${pdfFiles.length >= MAX_FILES ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Laser Scan animation on drag */}
          {dragActive && <div className="laser-line" />}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                processFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />
          <div
            className={`
              flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-colors duration-200
              ${dragActive ? 'bg-primary-100' : 'bg-slate-100'}
            `}
          >
            <Upload
              size={28}
              className={`transition-colors duration-200 ${
                dragActive ? 'text-primary-600' : 'text-slate-400'
              }`}
            />
          </div>
          <p className="text-sm font-semibold text-navy-800 mb-1">
            {dragActive ? 'Release to upload Naksha PDF' : 'Drag & drop Naksha PDF files here'}
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Supports PDF blueprints & building drawings (up to 15MB each)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-sm shadow-primary-600/20"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <FileUp size={16} />
              Browse Naksha PDF
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium">
            {pdfFiles.length} / {MAX_FILES} uploaded
          </p>
        </div>
      </Card>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* PDF Files List / Preview Grid */}
      {pdfFiles.length > 0 && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              <h3 className="text-sm font-bold text-navy-900">Staged Naksha Documents</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {pdfFiles.length} document{pdfFiles.length !== 1 ? 's' : ''} ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pdfFiles.map((pdf) => (
              <div
                key={pdf.id}
                className="group relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:border-primary-300 transition-all duration-200 p-4"
              >
                {/* Laser scan line on file card hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="laser-line" />
                </div>

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 shrink-0 border border-red-100">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy-900 truncate" title={pdf.name}>
                        {pdf.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{pdf.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePdf(pdf.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    title="Remove File"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Plan Type Selector */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Drawing Classification
                  </label>
                  <select
                    value={pdf.planType}
                    onChange={(e) => updatePlanType(pdf.id, e.target.value)}
                    className="w-full text-xs font-medium text-navy-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {PLAN_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Metadata Panel */}
      <Card padding="md">
        <h3 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2">
          <Building2 size={16} className="text-primary-600" />
          Building Plan Submission Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Project Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm text-navy-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Application / Tracking ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. NAKSHA-2026-9812"
                className="w-full text-sm text-navy-800 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <Barcode size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Municipal Jurisdiction / Zone
            </label>
            <div className="relative">
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. North Delhi Zone - Ward 14"
                className="w-full text-sm text-navy-800 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Action CTA */}
      <div className="flex justify-end">
        <Button
          size="lg"
          icon={<ScanLine size={18} />}
          disabled={pdfFiles.length === 0}
          onClick={handleSubmit}
        >
          Execute Compliance Scrutiny
        </Button>
      </div>
    </div>
  );
};

export default UploadZone;
