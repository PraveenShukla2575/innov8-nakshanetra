import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  FileDown,
  Package,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const DataTable = ({
  data = [],
  title = 'Verification Records',
  onViewDetails = () => {},
  onExportRow = () => {},
}) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Sorting
  const sortedData = useMemo(() => {
    const list = [...data];
    list.sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (sortField === 'timestamp') {
        const timeA = new Date(valA).getTime() || 0;
        const timeB = new Date(valB).getTime() || 0;
        return sortDir === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    return list;
  }, [data, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const allSelected =
    paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(item.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((i) => i.id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Top Toolbar */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <Package size={20} className="text-navy-900" />
          <h3 className="text-base font-bold text-navy-900">{title}</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="data-table min-w-[700px]">
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 accent-primary-600 rounded cursor-pointer"
                />
              </th>
              <th>
                <button
                  onClick={() => handleSort('timestamp')}
                  className="inline-flex items-center gap-1 hover:text-primary-300 transition-colors"
                >
                  Date {sortField === 'timestamp' && (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                </button>
              </th>
              <th>
                <button
                  onClick={() => handleSort('title')}
                  className="inline-flex items-center gap-1 hover:text-primary-300 transition-colors"
                >
                  Item / Subject {sortField === 'title' && (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                </button>
              </th>
              <th>Authority / Entity</th>
              <th>Status</th>
              <th>Officer In-Charge</th>
              <th className="w-14 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No records match your criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors duration-100 ${
                    selectedIds.has(row.id) ? 'bg-primary-50/60' : ''
                  }`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="w-3.5 h-3.5 accent-primary-600 rounded cursor-pointer"
                    />
                  </td>
                  <td>
                    <p className="text-xs font-semibold text-navy-900 whitespace-nowrap">
                      {row.timestamp ? new Date(row.timestamp).toLocaleDateString() : '—'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{row.id}</p>
                  </td>
                  <td>
                    <p className="text-xs font-bold text-navy-900 truncate max-w-[200px]">
                      {row.title}
                    </p>
                    <span className="text-[10px] text-slate-400">{row.category}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600">{row.entity || '—'}</span>
                  </td>
                  <td>
                    <StatusBadge status={row.status} size="sm" />
                  </td>
                  <td>
                    <span className="text-xs text-slate-600 font-medium">{row.officer || 'Unassigned'}</span>
                  </td>
                  <td className="text-right">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === row.id ? null : row.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {activeMenuId === row.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              onViewDetails(row);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-navy-800 hover:bg-slate-50 transition-colors"
                          >
                            <Eye size={14} className="text-slate-400" />
                            View Full Record
                          </button>
                          <button
                            onClick={() => {
                              onExportRow(row);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-navy-800 hover:bg-slate-50 transition-colors"
                          >
                            <FileDown size={14} className="text-slate-400" />
                            Download PDF Notice
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs font-medium text-navy-900 bg-white border border-slate-200 rounded-lg px-2 py-1"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-2">
            {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length}
          </span>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
