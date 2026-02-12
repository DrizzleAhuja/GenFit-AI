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
      <div className="min-h-screen flex flex-col bg-[#020617] text-white">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-2xl">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white">
      <NavBar />
      <main className="flex-grow">
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
          </div>
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <header className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4">
                <span className="text-xs sm:text-sm font-semibold text-gray-100">Your overview</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">Dashboard</span>
              </h1>
              <p className="max-w-3xl mx-auto text-sm sm:text-base lg:text-lg text-gray-300">Welcome back, {user?.firstName || 'Fitness Enthusiast'}. Here’s your progress.</p>
            </header>

          {/* Stats Grid - Features style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">This Week</div>
                <FaChartLine className="text-[#22D3EE]" />
              </div>
              <div className="text-3xl font-bold">{stats.weeklyPoints || 0}</div>
              <div className="text-xs text-gray-400 mt-1">points</div>
            </div>
            <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">All-Time</div>
                <FaTrophy className="text-[#FACC15]" />
              </div>
              <div className="text-3xl font-bold">{stats.points || 0}</div>
              <div className="text-xs text-gray-400 mt-1">points</div>
            </div>
            <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">Streak</div>
                <FaFire className="text-[#F97316]" />
              </div>
              <div className="text-3xl font-bold">{stats.streakCount || 0}</div>
              <div className="text-xs text-gray-400 mt-1">days 🔥</div>
            </div>
            <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">Badges</div>
                <FaTrophy className="text-[#22D3EE]" />
              </div>
              <div className="text-3xl font-bold">{(stats.badges || []).length}</div>
              <div className="text-xs text-gray-400 mt-1">{getNextBadgeHint()}</div>
            </div>
          </div>

          {/* Weekly Challenge & Adherence - Features style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
              <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
                <FaDumbbell className="mr-2 text-[#22D3EE]" />
                Weekly Challenge
              </h2>
              <div className="text-white font-semibold mb-2">{stats.weeklyChallenge?.title || 'Log 3 workouts this week'}</div>
              <div className="w-full bg-[#020617]/60 rounded-full h-3 mb-2 border border-[#1F2937] overflow-hidden">
                <div className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] h-3 rounded-full transition-all" style={{ width: `${Math.min(100, ((stats.weeklyChallenge?.progress || 0) / (stats.weeklyChallenge?.target || 3)) * 100)}%` }}></div>
              </div>
              <div className="text-gray-300 text-sm">{stats.weeklyChallenge?.progress || 0}/{stats.weeklyChallenge?.target || 3} workouts {stats.weeklyChallenge?.completed ? '✅' : ''}</div>
            </div>

            <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
              <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
                <FaChartLine className="mr-2 text-[#22D3EE]" />
                Workout Adherence
              </h2>
              {adherence.active ? (
                <>
                  <div className="text-white font-semibold mb-2">This week: {adherence.adherenceThisWeek || 0}%</div>
                  <div className="text-gray-300 text-sm mb-2">Last 4 weeks:</div>
                  <div className="flex space-x-2">
                    {(adherence.last4Weeks || []).map((w, i) => (
                      <div key={i} className="flex-1 bg-[#020617]/60 border border-[#1F2937] rounded p-2 text-center text-xs">
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

          {/* Quick Actions - Features style */}
          <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 mb-8 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all">
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
            <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button onClick={() => navigate('/CurrentBMI')} className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white py-3 rounded-lg font-medium hover:opacity-95 transition-all flex items-center justify-center">
                <FaRuler className="mr-2" /> BMI
              </button>
              <button onClick={() => navigate('/Workout')} className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white py-3 rounded-lg font-medium hover:opacity-95 transition-all flex items-center justify-center">
                <FaDumbbell className="mr-2" /> Workout
              </button>
              <button onClick={() => navigate('/diet-chart')} className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white py-3 rounded-lg font-medium hover:opacity-95 transition-all flex items-center justify-center">
                <FaAppleAlt className="mr-2" /> Diet
              </button>
              <button onClick={() => navigate('/leaderboard')} className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white py-3 rounded-lg font-medium hover:opacity-95 transition-all flex items-center justify-center">
                <FaTrophy className="mr-2" /> Leaderboard
              </button>
            </div>
          </div>

          {/* Recent Activity & Badges - Features style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
              <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
              {bmiHistory.length > 0 ? (
                <div className="space-y-3">
                  {bmiHistory.map((bmi, i) => (
                    <div key={i} className="bg-[#020617]/60 border border-[#1F2937] rounded-lg p-3 hover:border-[#22D3EE]/40 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-white">BMI: {bmi.bmi}</div>
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

            <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
              <h2 className="text-xl font-semibold mb-4 text-white">Your Badges</h2>
              {(stats.badges || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(stats.badges || []).map((badge, i) => (
                    <div key={i} className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white px-4 py-2 rounded-full text-sm font-semibold">
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
        </section>
      </main>
      <Footer />
    </div>
  );
}

