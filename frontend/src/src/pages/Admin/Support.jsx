import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api";
import { Loader } from "lucide-react";

export default function Support() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/messages`, {
        params: { page, limit: 15, type: "support" },
        headers: { email: user?.email },
      });
      if (res.data.success) {
        setMessages(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
          User Support Tickets
        </h1>
        <p className="text-gray-400 mt-1">Manage technical assistance queries.</p>
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
                <th className="px-6 py-4">Sender</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 text-gray-200">
              {messages.map((msg) => (
                <tr key={msg._id} className="hover:bg-purple-500/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{msg.name}</div>
                    <div className="text-xs text-gray-400">{msg.email || msg.user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-[#22D3EE]/20 text-[#22D3EE] px-2 py-1 rounded-md text-xs border border-[#22D3EE]/20">
                      {msg.item}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-sm truncate" title={msg.description}>
                    {msg.description}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(msg.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500">No support tickets found.</td></tr>
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
