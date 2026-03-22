import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { API_BASE_URL } from "../../../config/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPlan, setNewPlan] = useState('free');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { email: user.email },
        params: { page, search, limit: 10 }
      });
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleUpdatePlan = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await axios.put(`${API_BASE_URL}/api/admin/users/${selectedUser._id}/plan`, 
        { plan: newPlan },
        { headers: { email: user.email } }
      );
      setIsModalOpen(false);
      fetchUsers(); // Refresh list
    } catch (err) {
      alert('Failed to update plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent font-sans">
            User Management
          </h1>
          <p className="text-gray-400 mt-1">View and manage app users.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 pl-10 text-white focus:outline-none focus:border-[#22D3EE] transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="bg-[#0c0520]/40 backdrop-blur-md rounded-2xl border border-purple-500/20 overflow-hidden shadow-xl shadow-black/20">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading users...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-purple-500/20 bg-[#0c0520]/60">
                    <th className="py-4 px-6 font-semibold text-gray-400">Name</th>
                    <th className="py-4 px-6 font-semibold text-gray-400">Email</th>
                    <th className="py-4 px-6 font-semibold text-gray-400">Plan</th>
                    <th className="py-4 px-6 font-semibold text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10 text-gray-200">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-purple-500/5 transition-all font-sans">
                      <td className="py-4 px-6 font-medium text-white">{u.firstName} {u.lastName}</td>
                      <td className="py-4 px-6 text-gray-400">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          u.plan === 'pro' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-[#22D3EE]/20 text-[#22D3EE]'
                        }`}>
                          {u.plan?.toUpperCase() || 'FREE'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => { setSelectedUser(u); setNewPlan(u.plan || 'free'); setIsModalOpen(true); }}
                          className="p-2 hover:bg-[#8B5CF6]/10 rounded-lg text-[#22D3EE] hover:text-[#22D3EE] transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t border-purple-500/20">
              <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-lg bg-[#0c0520]/60 border border-purple-500/30 hover:bg-[#1a0c36] disabled:opacity-50 text-gray-300"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-lg bg-[#0c0520]/60 border border-purple-500/30 hover:bg-[#1a0c36] disabled:opacity-50 text-gray-300"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0c0520] border border-purple-500/30 rounded-2xl p-6 w-[400px] shadow-2xl shadow-purple-500/10">
            <h2 className="text-xl font-bold mb-1 bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">Update Plan</h2>
            <p className="text-sm text-gray-400 mb-4 font-sans">Edit plan for {selectedUser?.firstName}</p>
            
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Plan</label>
            <select 
              value={newPlan} 
              onChange={(e) => setNewPlan(e.target.value)}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 bg-purple-950/40 border border-purple-500/30 hover:bg-purple-900/40 rounded-xl text-white font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdatePlan}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] hover:opacity-90 rounded-xl text-black font-bold shadow-lg shadow-[#8B5CF6]/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

