import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { useNavigate } from "react-router-dom";
import { FaFire, FaTrophy, FaChartLine, FaDumbbell, FaAppleAlt, FaRuler } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Dashboard() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ points: 0, weeklyPoints: 0, streakCount: 0, badges: [], weeklyChallenge: {} });
  const [adherence, setAdherence] = useState({ active: false, adherenceThisWeek: 0, last4Weeks: [] });
  const [bmiHistory, setBmiHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.email || !user?._id) {
        setLoading(false);
        return;
      }
      try {
        const [s, a, b] = await Promise.all([
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.GAMIFY}/stats`, { params: { email: user.email } }),
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.GAMIFY}/adherence`, { params: { userId: user._id } }),
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.BMI}/history`, { params: { email: user.email } }),
        ]);
        setStats(s.data || {});
        setAdherence(a.data || {});
        setBmiHistory((b.data || []).slice(0, 3));
      } catch (e) {
        console.error("Dashboard load error:", e);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const getNextBadgeHint = () => {
    const badges = stats.badges || [];
    if (badges.includes('30-Day Streak')) return 'Next: Maintain streak!';
    if (badges.includes('14-Day Streak')) return 'Next: 30-Day Streak';
    if (badges.includes('7-Day Streak')) return 'Next: 14-Day Streak';
    if (badges.includes('3-Day Streak')) return 'Next: 7-Day Streak';
    return 'Earn 3-Day Streak';
  };

  if (loading) {
    return (
      <div className="dark">
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center text-white">
          <div className="text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark">
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">This Week</div>
                <FaChartLine className="text-blue-400" />
              </div>
              <div className="text-3xl font-bold">{stats.weeklyPoints || 0}</div>
              <div className="text-xs text-gray-400 mt-1">points</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">All-Time</div>
                <FaTrophy className="text-yellow-400" />
              </div>
              <div className="text-3xl font-bold">{stats.points || 0}</div>
              <div className="text-xs text-gray-400 mt-1">points</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">Streak</div>
                <FaFire className="text-orange-500" />
              </div>
              <div className="text-3xl font-bold">{stats.streakCount || 0}</div>
              <div className="text-xs text-gray-400 mt-1">days 🔥</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">Badges</div>
                <FaTrophy className="text-green-400" />
              </div>
              <div className="text-3xl font-bold">{(stats.badges || []).length}</div>
              <div className="text-xs text-gray-400 mt-1">{getNextBadgeHint()}</div>
            </div>
          </div>

          {/* Weekly Challenge & Adherence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaDumbbell className="mr-2 text-blue-400" />
                Weekly Challenge
              </h2>
              <div className="text-white font-semibold mb-2">{stats.weeklyChallenge?.title || 'Log 3 workouts this week'}</div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full" style={{ width: `${Math.min(100, ((stats.weeklyChallenge?.progress || 0) / (stats.weeklyChallenge?.target || 3)) * 100)}%` }}></div>
              </div>
              <div className="text-gray-300 text-sm">{stats.weeklyChallenge?.progress || 0}/{stats.weeklyChallenge?.target || 3} workouts {stats.weeklyChallenge?.completed ? '✅' : ''}</div>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaChartLine className="mr-2 text-green-400" />
                Workout Adherence
              </h2>
              {adherence.active ? (
                <>
                  <div className="text-white font-semibold mb-2">This week: {adherence.adherenceThisWeek || 0}%</div>
                  <div className="text-gray-300 text-sm mb-2">Last 4 weeks:</div>
                  <div className="flex space-x-2">
                    {(adherence.last4Weeks || []).map((w, i) => (
                      <div key={i} className="flex-1 bg-gray-700 rounded p-2 text-center text-xs">
                        <div>W{w.week}</div>
                        <div className="font-semibold">{w.percent}%</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-gray-400">No active workout plan</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button onClick={() => navigate('/CurrentBMI')} className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center">
                <FaRuler className="mr-2" /> BMI
              </button>
              <button onClick={() => navigate('/Workout')} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center">
                <FaDumbbell className="mr-2" /> Workout
              </button>
              <button onClick={() => navigate('/diet-chart')} className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center">
                <FaAppleAlt className="mr-2" /> Diet
              </button>
              <button onClick={() => navigate('/leaderboard')} className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center">
                <FaTrophy className="mr-2" /> Leaderboard
              </button>
            </div>
          </div>

          {/* Recent Activity & Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              {bmiHistory.length > 0 ? (
                <div className="space-y-3">
                  {bmiHistory.map((bmi, i) => (
                    <div key={i} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">BMI: {bmi.bmi}</div>
                          <div className="text-sm text-gray-300">{bmi.category}</div>
                        </div>
                        <div className="text-sm text-gray-400">{new Date(bmi.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">No recent activity</div>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Your Badges</h2>
              {(stats.badges || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(stats.badges || []).map((badge, i) => (
                    <div key={i} className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {badge} 🏆
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">No badges yet. Complete challenges to earn them!</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

