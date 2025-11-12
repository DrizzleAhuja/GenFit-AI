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

  const Row = ({ u, i, weeklyMode }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-700 rounded-lg border border-gray-600">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">{i+1}</div>
        <div>
          <div className="font-semibold">{u.firstName || 'User'} {u.lastName || ''}</div>
          <div className="text-xs text-gray-300">{u.email}</div>
        </div>
      </div>
      <div className="text-lg font-bold">{weeklyMode ? (u.weeklyPoints || 0) : (u.points || 0)} pts</div>
    </div>
  );

  return (
    <div className="dark">
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <div className="text-sm text-gray-300">This Week</div>
              <div className="text-3xl font-bold">{stats.weeklyPoints || 0}</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <div className="text-sm text-gray-300">All-Time</div>
              <div className="text-3xl font-bold">{stats.points || 0}</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <div className="text-sm text-gray-300">Streak</div>
              <div className="text-3xl font-bold">{stats.streakCount || 0} 🔥</div>
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


