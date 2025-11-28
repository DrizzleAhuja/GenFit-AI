import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";

export default function Leaderboard() {
  const user = useSelector(selectUser);
  const [weekly, setWeekly] = useState([]);
  const [allTime, setAllTime] = useState([]);
  const [stats, setStats] = useState({ points: 0, weeklyPoints: 0, streakCount: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [w, a] = await Promise.all([
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.GAMIFY}/leaderboard`, { params: { period: 'week' } }),
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.GAMIFY}/leaderboard`, { params: { period: 'all' } }),
        ]);
        setWeekly(w.data.users || []);
        setAllTime(a.data.users || []);
      } catch {}
      try {
        if (user?.email) {
          const s = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GAMIFY}/stats`, { params: { email: user.email } });
          setStats(s.data || {});
        }
      } catch {}
    }
    load();
  }, [user]);

  const Row = ({ u, i, weeklyMode }) => {
    const points = weeklyMode ? (u.weeklyPoints || 0) : (u.points || 0);
    const isCurrentUser = user?.email === u.email;
    
    return (
      <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-500' 
          : 'bg-gray-700 border-gray-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            i === 0 ? 'bg-yellow-500 text-yellow-900' :
            i === 1 ? 'bg-gray-400 text-gray-900' :
            i === 2 ? 'bg-orange-500 text-orange-900' :
            isCurrentUser ? 'bg-green-500 text-white' :
            'bg-gray-600 text-gray-300'
          }`}>
            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
          </div>
          <div>
            <div className="font-semibold flex items-center gap-2">
              {u.firstName || 'User'} {u.lastName || ''}
              {isCurrentUser && <span className="text-xs bg-green-500 px-2 py-0.5 rounded text-white">You</span>}
            </div>
            <div className="text-xs text-gray-300">{u.email}</div>
          </div>
        </div>
        <div className="text-lg font-bold text-green-400">{points} pts</div>
      </div>
    );
  };

  return (
    <div className="dark">
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <div className="text-sm text-gray-300 mb-1">This Week Points</div>
              <div className="text-3xl font-bold text-green-400">{stats.weeklyPoints || 0}</div>
              <div className="text-xs text-gray-400 mt-2">Earned this week</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <div className="text-sm text-gray-300 mb-1">All-Time Points</div>
              <div className="text-3xl font-bold text-blue-400">{stats.points || 0}</div>
              <div className="text-xs text-gray-400 mt-2">Total lifetime points</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <div className="text-sm text-gray-300 mb-1">Current Streak</div>
              <div className="text-3xl font-bold text-orange-400">{stats.streakCount || 0} 🔥</div>
              <div className="text-xs text-gray-400 mt-2">Consecutive days</div>
            </div>
          </div>

          {/* Points Breakdown Info */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl shadow-xl border border-purple-700 p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">💡 How Points Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">BMI Save/Update</span>
                <span className="font-bold text-green-400">+10 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Workout Plan Generated</span>
                <span className="font-bold text-blue-400">+20 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Workout Day Completed</span>
                <span className="font-bold text-yellow-400">+20 pts</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Diet Chart Generated</span>
                <span className="font-bold text-pink-400">+20 pts</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">This Week Top 50</h2>
              <div className="space-y-2">
                {weekly.map((u, i) => <Row key={u._id || i} u={u} i={i} weeklyMode />)}
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">All-Time Top 50</h2>
              <div className="space-y-2">
                {allTime.map((u, i) => <Row key={u._id || i} u={u} i={i} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


