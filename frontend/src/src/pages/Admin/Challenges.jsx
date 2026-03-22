import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../../../config/api";
import { PlusCircle, Target, Award, Calendar, RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Challenges() {
  const [formData, setFormData] = useState({
    title: '',
    target: '',
    points: 30,
    type: 'workout',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await axios.post(`${API_BASE_URL}/api/admin/create-challenge`, formData, {
        headers: { email: user.email }
      });
      if (res.data.success) {
        toast.success("Weekly Challenge Created & Disseminated!");
        setFormData({ title: '', target: '', points: 30, type: 'workout', startDate: '', endDate: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create challenge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
          Weekly Challenges
        </h1>
        <p className="text-gray-400 mt-1">Deploy global challenges pushing rewards to users immediately.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0c0520]/40 backdrop-blur-md rounded-2xl p-8 border border-purple-500/20 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Challenge Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g., Log 5 Workouts"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Target Threshold (Count)</label>
            <input 
              type="number" 
              required
              min="1"
              placeholder="e.g., 5"
              value={formData.target}
              onChange={(e) => setFormData({...formData, target: e.target.value})}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Points Reward</label>
            <input 
              type="number" 
              min="1"
              value={formData.points}
              onChange={(e) => setFormData({...formData, points: e.target.value})}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
            <input 
              type="date" 
              required
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
            <input 
              type="date" 
              required
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] py-3 rounded-xl text-black font-bold shadow-lg shadow-[#8B5CF6]/20 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all mt-4"
        >
          {loading ? <RefreshCcw className="animate-spin" size={20} /> : <PlusCircle size={20} />}
          {loading ? "Creating..." : "Launch Challenge"}
        </button>
      </form>
    </div>
  );
}
