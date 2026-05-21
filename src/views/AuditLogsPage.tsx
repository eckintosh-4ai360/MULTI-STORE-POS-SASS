import React, { useState, useEffect } from "react";
import { usePOSStore } from "../store/posStore";
import { 
  ClipboardList, Search, Filter, Calendar, User, Info, 
  Terminal, ShieldAlert, CheckCircle2, ChevronLeft, ChevronRight,
  Download, RefreshCw, Eye
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
  const [actorFilter, setActorFilter] = useState("");
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
        ...(actorFilter ? { actorId: actorFilter } : {}),
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
  }, [page, actionFilter, actorFilter, resourceFilter, fromDate, toDate]);

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

  const getActionBadgeColor = (action: string) => {
    if (action.includes("DELETED") || action.includes("DEACTIVATED") || action.includes("REFUNDED")) {
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    }
    if (action.includes("CREATED") || action.includes("REGISTERED") || action.includes("COMPLETED")) {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
    if (action.includes("UPDATED") || action.includes("ADJUSTED")) {
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    }
    return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="text-primary-500" />
            System Audit Trail
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Canonical tracking of administrative and security events for compliance and debugging.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition border border-white/5"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl border border-white/60 p-5 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Action Type
          </label>
          <div className="relative">
            <Filter className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-white focus:outline-none focus:border-primary-500 transition text-sm appearance-none"
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

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Resource Type
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <select
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-white focus:outline-none focus:border-primary-500 transition text-sm appearance-none"
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

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-white focus:outline-none focus:border-primary-500 transition text-sm text-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-white focus:outline-none focus:border-primary-500 transition text-sm text-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-2xl border border-white/60 overflow-hidden bg-slate-900/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-primary-500" />
                    Fetching latest audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-medium">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition text-sm text-slate-300">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-primary-400">
                          {log.actorName ? log.actorName.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{log.actorName || "System"}</p>
                          <p className="text-xs text-slate-400">{log.actorRole || "Automated"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.resourceType ? (
                        <div>
                          <p className="font-semibold text-slate-200">{log.resourceLabel || "N/A"}</p>
                          <p className="text-xs text-slate-400">{log.resourceType} ({log.resourceId?.slice(0, 8)})</p>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {log.ipAddress || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition border border-white/5"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 bg-slate-950/20 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing page {page} of {totalPages} ({total} entries total)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-slate-300 transition"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
                    page === i + 1 
                      ? "bg-primary-600 text-white" 
                      : "bg-slate-850 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-slate-300 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl border border-white/60 max-w-2xl w-full bg-slate-950/95 overflow-hidden shadow-2xl animate-scaleIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/40">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal size={18} className="text-primary-500" />
                  Audit Log Entry Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
              >
                Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Actor
                  </span>
                  <p className="font-semibold text-white text-sm">{selectedLog.actorName || "System"}</p>
                  <p className="text-xs text-slate-400">{selectedLog.actorEmail || "System Account"}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono uppercase">
                    {selectedLog.actorRole || "N/A"}
                  </span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Action Event
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getActionBadgeColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">
                    Timestamp: {format(new Date(selectedLog.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </p>
                </div>
              </div>

              {/* Resource context */}
              {selectedLog.resourceType && (
                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Affected Resource
                  </span>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-200">{selectedLog.resourceLabel}</span>
                    <span className="text-xs font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      {selectedLog.resourceType}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-500">ID: {selectedLog.resourceId}</p>
                </div>
              )}

              {/* Network / Client context */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Request Metadata
                </span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">IP Address</span>
                    <span className="font-mono text-slate-200">{selectedLog.ipAddress || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Store context</span>
                    <span className="text-slate-200">{selectedLog.storeName || "Global / None"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">User Agent</span>
                    <span className="font-mono text-[10px] text-slate-300 break-all leading-normal block max-h-12 overflow-y-auto">
                      {selectedLog.userAgent || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payload metadata JSON */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Event Data Payload (Metadata)
                </span>
                <pre className="bg-slate-950 p-4 rounded-xl border border-white/10 text-xs text-emerald-400 font-mono overflow-x-auto max-h-48">
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
