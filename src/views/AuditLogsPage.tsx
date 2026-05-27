import React, { useState, useEffect } from "react";
import { usePOSStore } from "../store/posStore";
import {
  ClipboardList, Filter, Calendar,
  Terminal, ChevronLeft, ChevronRight,
  Download, RefreshCw, Eye, Search, X
} from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorRole: string | null;
  actorEmail: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  resourceLabel: string | null;
  organizationId: string;
  storeId: string | null;
  storeName: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export const AuditLogsPage: React.FC = () => {
  const { currentUser } = usePOSStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchLogs = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(actionFilter ? { action: actionFilter } : {}),
        ...(resourceFilter ? { resourceType: resourceFilter } : {}),
        ...(fromDate ? { from: fromDate } : {}),
        ...(toDate ? { to: toDate } : {}),
      });

      const res = await fetch(`/api/audit-logs?${query.toString()}`, {
        headers: { "x-user-id": currentUser.id },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, resourceFilter, fromDate, toDate]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Date,Actor,Role,Action,Resource,Details,IP Address"].join(",") + "\n"
      + logs.map(log => [
          log.createdAt,
          log.actorName || "System",
          log.actorRole || "N/A",
          log.action,
          `${log.resourceType || ""}:${log.resourceLabel || ""}`,
          JSON.stringify(log.metadata || {}).replace(/"/g, '""'),
          log.ipAddress || ""
        ].map(val => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_log_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: string) => {
    if (action.includes("DELETED") || action.includes("DEACTIVATED") || action.includes("REFUNDED"))
      return { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" };
    if (action.includes("CREATED") || action.includes("REGISTERED") || action.includes("COMPLETED"))
      return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" };
    if (action.includes("UPDATED") || action.includes("ADJUSTED"))
      return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" };
    return { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" };
  };

  const totalPages = Math.ceil(total / limit);

  const hasFilters = actionFilter || resourceFilter || fromDate || toDate;

  const clearFilters = () => {
    setActionFilter("");
    setResourceFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <ClipboardList className="text-indigo-600" size={20} />
            </div>
            System Audit Trail
          </h1>
          <p className="text-slate-500 mt-1 text-sm ml-11">
            Canonical tracking of administrative and security events for compliance and debugging.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-11 sm:ml-0">
          <button
            onClick={() => fetchLogs()}
            className="flex items-center gap-2 px-4 py-2.5 glass-card border border-white/70 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 rounded-xl text-sm font-semibold transition"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-indigo-500" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-emerald-500/20"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl border border-white/70 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action Type */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Action Type
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-slate-700 focus:outline-none text-sm appearance-none font-medium"
              >
                <option value="">All Actions</option>
                <option value="USER_LOGIN">User Logins</option>
                <option value="USER_REGISTERED">Registrations</option>
                <option value="PRODUCT_CREATED">Product Creations</option>
                <option value="PRODUCT_UPDATED">Product Updates</option>
                <option value="PRODUCT_DELETED">Product Deletions</option>
                <option value="INVENTORY_ADJUSTED">Stock Adjustments</option>
                <option value="SALE_COMPLETED">Completed Sales</option>
                <option value="USER_CREATED">User Added</option>
                <option value="USER_UPDATED">User Updates</option>
                <option value="STORE_CREATED">Store Additions</option>
                <option value="STORE_UPDATED">Store Updates</option>
              </select>
            </div>
          </div>

          {/* Resource Type */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Resource Type
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <select
                value={resourceFilter}
                onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-slate-700 focus:outline-none text-sm appearance-none font-medium"
              >
                <option value="">All Resources</option>
                <option value="Product">Products</option>
                <option value="Sale">Sales</option>
                <option value="User">Users</option>
                <option value="Store">Stores</option>
                <option value="Organization">Organizations</option>
              </select>
            </div>
          </div>

          {/* From Date */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-slate-700 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* To Date */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              To Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-slate-700 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Filters active</span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 transition"
            >
              <X size={12} /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-2xl border border-white/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse glass-table">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4">Actor</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Resource</th>
                <th className="px-5 py-4">IP Address</th>
                <th className="px-5 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <RefreshCw size={22} className="animate-spin mx-auto mb-2 text-indigo-500" />
                    <p className="text-sm font-medium">Fetching latest audit logs…</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <ClipboardList size={24} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium text-sm">No matching audit records found.</p>
                    <p className="text-slate-400 text-xs mt-1">Try adjusting your filters above.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-indigo-50/30 transition text-sm text-slate-700">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm">
                            {log.actorName ? log.actorName.charAt(0).toUpperCase() : "S"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{log.actorName || "System"}</p>
                            <p className="text-xs text-slate-400 capitalize">{log.actorRole?.replace("_", " ") || "Automated"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {log.resourceType ? (
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{log.resourceLabel || "N/A"}</p>
                            <p className="text-xs text-slate-400">{log.resourceType} · {log.resourceId?.slice(0, 8)}</p>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                        {log.ipAddress || "Unknown"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 glass-card border border-white/70 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-semibold transition"
                        >
                          <Eye size={12} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs text-slate-400 font-medium">
              Page {page} of {totalPages} · {total} entries total
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 glass-card border border-white/70 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-slate-500 hover:text-indigo-600 transition"
              >
                <ChevronLeft size={15} />
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                      page === pg
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "glass-card border border-white/70 hover:border-indigo-200 text-slate-500 hover:text-indigo-600"
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 glass-card border border-white/70 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-slate-500 hover:text-indigo-600 transition"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-3xl max-w-2xl w-full overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Terminal size={16} className="text-indigo-500" />
                  Audit Log Entry Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Actor</span>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {selectedLog.actorName?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{selectedLog.actorName || "System"}</p>
                      <p className="text-xs text-slate-400">{selectedLog.actorEmail || "System Account"}</p>
                    </div>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-bold uppercase font-mono">
                    {selectedLog.actorRole || "N/A"}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-2">Action Event</span>
                  {(() => {
                    const badge = getActionBadge(selectedLog.action);
                    return (
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {selectedLog.action}
                      </span>
                    );
                  })()}
                  <p className="text-xs text-slate-400 mt-2">
                    {format(new Date(selectedLog.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </p>
                </div>
              </div>

              {/* Resource context */}
              {selectedLog.resourceType && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-2">Affected Resource</span>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 text-sm">{selectedLog.resourceLabel}</span>
                    <span className="text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-500">
                      {selectedLog.resourceType}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-1">ID: {selectedLog.resourceId}</p>
                </div>
              )}

              {/* Network / Client context */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-3">Request Metadata</span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">IP Address</span>
                    <span className="font-mono font-semibold text-slate-700">{selectedLog.ipAddress || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Store Context</span>
                    <span className="font-semibold text-slate-700">{selectedLog.storeName || "Global / None"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5">User Agent</span>
                    <span className="font-mono text-[10px] text-slate-500 break-all leading-normal block max-h-12 overflow-y-auto">
                      {selectedLog.userAgent || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payload metadata JSON */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-2">Event Data Payload</span>
                <pre className="bg-slate-900 p-4 rounded-2xl text-xs text-emerald-400 font-mono overflow-x-auto max-h-48 leading-relaxed">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
