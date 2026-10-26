import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
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
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const CATEGORY_OPTIONS = [
  'Residential - Plotted Housing',
  'Commercial Complex',
  'Industrial & Warehouse Hub',
  'Institutional / Educational',
  'Mixed-Use Commercial & Residential',
];

export const UploadZone = ({ onScrutinyComplete = () => {} }) => {
  const [stagedFiles, setStagedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [trackingId, setTrackingId] = useState('');
  const [zone, setZone] = useState('');
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(''); // Live step message
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isSupportedFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    return (
      ALLOWED_EXTENSIONS.includes(ext) ||
      file.type === 'application/pdf' ||
      file.type.startsWith('image/')
    );
  };

  const processFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList);
      const validFiles = files.filter(isSupportedFile);

      if (validFiles.length === 0) {
        setError('Please upload a valid building plan document (.pdf, .jpg, .jpeg, or .png).');
        return;
      }

      // Check size limit (15MB)
      const oversized = validFiles.find((f) => f.size > MAX_FILE_SIZE);
      if (oversized) {
        setError(`"${oversized.name}" exceeds the 15MB limit. Please upload files under 15MB.`);
        return;
      }

      const remaining = MAX_FILES - stagedFiles.length;
      if (remaining <= 0) {
        setError(`Maximum ${MAX_FILES} building plans allowed per submission.`);
        return;
      }

      const toAdd = validFiles.slice(0, remaining).map((file, i) => {
        const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(file.name);
        return {
          id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          file,
          name: file.name,
          size: formatFileSize(file.size),
          isImage: isImg,
          previewUrl: isImg ? URL.createObjectURL(file) : null,
        };
      });

      setStagedFiles((prev) => [...prev, ...toAdd]);
      setError(null);
    },
    [stagedFiles.length]
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

  const removeFile = (id) => {
    setStagedFiles((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // 1-Click Load Pre-generated Demo Test Plans
  const loadDemoPlan = async (filename, label) => {
    try {
      setError(null);
      const res = await fetch(`/test_plans/${filename}`);
      if (!res.ok) {
        throw new Error(`Failed to load ${filename} from public assets`);
      }
      const blob = await res.blob();
      const demoFile = new File([blob], filename, { type: 'image/jpeg' });
      processFiles([demoFile]);
    } catch (err) {
      setError(`Could not load demo asset: ${err.message}`);
    }
  };

  // Submit actual file to FastAPI Backend
  const handleExecuteVerification = async () => {
    if (stagedFiles.length === 0) return;
    setError(null);
    setIsScanning(true);
    setScanStage('Transmitting architectural blueprint to GovTech Compliance Engine...');

    const timer1 = setTimeout(() => {
      setScanStage('Gemini Multimodal AI Vision extracting architectural dimensions (rear setback, ground coverage)...');
    }, 900);

    const timer2 = setTimeout(() => {
      setScanStage('Deterministic Bye-Law Engine evaluating against municipal codes (BL-001, BL-002)...');
    }, 2500);

    try {
      const targetFileObj = stagedFiles[0].file;
      const formData = new FormData();
      formData.append('file', targetFileObj);
      formData.append('citizen_id', '1');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/applications/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 90000,
        }
      );

      clearTimeout(timer1);
      clearTimeout(timer2);
      setScanStage('Compliance scrutiny report generated successfully!');

      // Brief delay for visual confirmation before finishing
      await new Promise((resolve) => setTimeout(resolve, 600));

      try {
        if (typeof onScrutinyComplete === 'function') {
          onScrutinyComplete({
            application: response.data,
            category,
            trackingId: trackingId || `APP-2026-${response.data.id || '9812'}`,
            zone: zone || 'Delhi Municipal Corporation - Ward 14',
            uploadedFileName: targetFileObj.name,
          });
        }
      } catch (callbackErr) {
        console.error('Scrutiny data mapping error:', callbackErr);
        setError(`Processing Error: ${callbackErr.message || 'Error occurred while loading scrutiny report.'}`);
      }
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('Scrutiny upload failed:', err);

      let detailMsg = 'Failed to connect to backend scrutiny engine.';
      if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
        detailMsg = 'Verification request timed out after 90 seconds while waiting for AI scrutiny engine. Please retry or check server logs.';
      } else if (err.response?.data?.detail) {
        detailMsg =
          typeof err.response.data.detail === 'string'
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail);
      } else if (err.message) {
        detailMsg = err.message;
      }
      setError(`Scrutiny Error: ${detailMsg}`);
    } finally {
      setIsScanning(false);
      setScanStage('');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Upload Zone Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600">
            <FileUp size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-900">Upload Building Plan (Naksha)</h2>
            <p className="text-xs text-slate-500">
              Upload PDF or JPG/PNG blueprints for Gemini AI & Bye-Law compliance verification
            </p>
          </div>
        </div>

        {/* Quick Demo Test Plans Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:inline">
            Quick Test:
          </span>
          <button
            type="button"
            onClick={() => loadDemoPlan('plan1_compliant.jpg', 'Plan 1')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            Plan 1 (Compliant)
          </button>
          <button
            type="button"
            onClick={() => loadDemoPlan('plan2_violation.jpg', 'Plan 2')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
          >
            <AlertTriangle size={14} className="text-red-600" />
            Plan 2 (Violation)
          </button>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <Card padding="none">
        <div
          id="drop-zone"
          className={`
            relative flex flex-col items-center justify-center
            border-2 border-dashed rounded-xl cursor-pointer
            transition-all duration-200 p-8 sm:p-10 overflow-hidden
            ${
              dragActive
                ? 'drop-zone-active'
                : 'border-slate-300 hover:border-primary-400 hover:bg-primary-50/20'
            }
            ${stagedFiles.length >= MAX_FILES || isScanning ? 'opacity-60 pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isScanning && fileInputRef.current?.click()}
        >
          {/* Laser Scan animation on drag or scanning */}
          {(dragActive || isScanning) && <div className="laser-line" />}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
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
              ${dragActive || isScanning ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}
            `}
          >
            {isScanning ? (
              <Loader2 size={30} className="animate-spin text-primary-600" />
            ) : (
              <Upload size={28} />
            )}
          </div>

          <p className="text-sm font-semibold text-navy-800 mb-1 text-center">
            {isScanning
              ? 'Analyzing Building Plan with Gemini Multimodal AI...'
              : dragActive
              ? 'Release to upload Naksha'
              : 'Drag & drop Naksha blueprint here, or click to browse'}
          </p>
          <p className="text-xs text-slate-400 mb-4 text-center">
            Supports PDF, JPG, and PNG building plan drawings (up to 15MB each)
          </p>

          {!isScanning && (
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
                Browse Building Plan
              </button>
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-3 font-medium">
            {stagedFiles.length} / {MAX_FILES} staged
          </p>
        </div>
      </Card>

      {/* Live Scanning Progress Overlay / Banner */}
      {isScanning && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary-900 via-navy-900 to-indigo-950 text-white shadow-lg border border-primary-500/30 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500/20 border border-primary-400/40 text-primary-300">
              <Sparkles size={18} className="animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-300">
                Core Compliance Engine Active
              </p>
              <p className="text-sm font-medium text-slate-100 mt-0.5 truncate">{scanStage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Staged Files List / Preview Grid */}
      {stagedFiles.length > 0 && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              <h3 className="text-sm font-bold text-navy-900">Staged Naksha Blueprint</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {stagedFiles.length} document{stagedFiles.length !== 1 ? 's' : ''} ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stagedFiles.map((item) => (
              <div
                key={item.id}
                className="group relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:border-primary-300 transition-all duration-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.isImage && item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt="Naksha thumbnail"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-50 text-red-600 shrink-0 border border-red-100">
                        <FileText size={22} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy-900 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.size}</p>
                    </div>
                  </div>
                  {!isScanning && (
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                      title="Remove File"
                    >
                      <X size={16} />
                    </button>
                  )}
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
              disabled={isScanning}
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
                disabled={isScanning}
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
                disabled={isScanning}
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

      {/* Action CTA: Execute Verification Check */}
      <div className="flex justify-end">
        <Button
          size="lg"
          icon={isScanning ? <Loader2 size={18} className="animate-spin" /> : <ScanLine size={18} />}
          disabled={stagedFiles.length === 0 || isScanning}
          onClick={handleExecuteVerification}
        >
          {isScanning ? 'Executing Compliance Scrutiny...' : 'Execute Compliance Scrutiny'}
        </Button>
      </div>
    </div>
  );
};

export default UploadZone;
