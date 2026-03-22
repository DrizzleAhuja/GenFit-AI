import React, { useState, useEffect } from 'react';
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
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);

  const fetchCurrentChallenge = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await axios.get(`${API_BASE_URL}/api/admin/current-challenge`, {
        headers: { email: user.email }
      });
      if (res.data.success) {
        setCurrentChallenge(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch challenge", err);
    } finally {
      setLoadingChallenge(false);
    }
  };

  useEffect(() => {
    fetchCurrentChallenge();
  }, []);


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

      {loadingChallenge ? (
         <p className="text-gray-400">Loading current challenge...</p>
      ) : currentChallenge ? (
         <div className="bg-[#0c0520]/60 p-5 rounded-2xl border border-[#22D3EE]/30 backdrop-blur-md shadow-lg">
           <h3 className="text-lg font-bold text-[#22D3EE] flex items-center gap-2"><Award /> Active Challenge</h3>
           <p className="text-white font-medium mt-1">{currentChallenge.title}</p>
           <div className="text-sm text-gray-400 mt-2 flex flex-col gap-1">
             <div>Target: <span className="text-purple-400 font-bold">{currentChallenge.target}</span> | Points: <span className="text-yellow-400 font-bold">{currentChallenge.points}</span></div>
             <div>Starts: {new Date(currentChallenge.weekStartAt).toLocaleDateString()} | Ends: {currentChallenge.weekEndAt ? new Date(currentChallenge.weekEndAt).toLocaleDateString() : 'Continuous'}</div>
           </div>
         </div>
      ) : (
         <p className="text-gray-500 text-sm">No active challenge running right now.</p>
      )}


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
