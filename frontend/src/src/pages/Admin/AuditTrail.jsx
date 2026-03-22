import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api";
import { Search, Loader } from "lucide-react";

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/user-logs`, {
        params: { page, search, limit: 15 },
        headers: { email: user?.email },
      });
      if (res.data.success) {
        setLogs(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
          User Audit Trail
        </h1>
        <p className="text-gray-400 mt-1">Monitor real-time user activities and interaction logs.</p>
      </div>

      <div className="flex justify-between items-center gap-4 bg-[#0c0520]/40 p-4 rounded-xl backdrop-blur-md border border-purple-500/20 shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search action or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#22D3EE] transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-[#22D3EE]" size={40} /></div>
      ) : error ? (
        <div className="text-red-500 text-center py-10 font-bold">{error}</div>
      ) : (
        <div className="bg-[#0c0520]/40 rounded-2xl backdrop-blur-md border border-purple-500/20 overflow-hidden shadow-xl shadow-black/20">
          <table className="w-full text-left">
            <thead className="bg-[#0c0520]/60 text-gray-400 text-sm uppercase">
              <tr className="border-b border-purple-500/20">
                <th className="px-6 py-4">User Email</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 text-gray-200">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-purple-500/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#22D3EE]">{log.userEmail}</td>
                  <td className="px-6 py-4">{log.action}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="3" className="text-center py-10 text-gray-500">No logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 px-4 bg-[#0c0520]/60 border border-purple-500/30 rounded-lg disabled:opacity-50 hover:bg-[#1a0c36] text-gray-300"
          >
            Prev
          </button>
          <span className="flex items-center text-gray-300">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 px-4 bg-[#0c0520]/60 border border-purple-500/30 rounded-lg disabled:opacity-50 hover:bg-[#1a0c36] text-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

}
