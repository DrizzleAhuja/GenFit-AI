import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import HeroSection from "./HeroSection";
import Section2 from "./Section2";
import CallToAction from "./CallToAction";
import HowItWorks from "./HowItWorks";
import Footer from "./Footer";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import { FiTrendingUp, FiAward, FiZap, FiTarget, FiCheckCircle, FiActivity, FiBarChart2 } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Home() {
  const user = useSelector(selectUser);
  const [stats, setStats] = useState({ points: 0, weeklyPoints: 0, streakCount: 0, badges: [], weeklyChallenge: {} });
  const [adherence, setAdherence] = useState({ active: false, adherenceThisWeek: 0, last4Weeks: [] });

  useEffect(() => {
    async function load() {
      try {
        if (user?.email) {
          const s = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GAMIFY}/stats`, { params: { email: user.email } });
          setStats(s.data || {});
        }
        if (user?._id) {
          const a = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GAMIFY}/adherence`, { params: { userId: user._id } });
          setAdherence(a.data || {});
        }
      } catch {}
    }
    load();
  }, [user]);

  const getNextBadge = () => {
    if ((stats.badges || []).includes('30-Day Streak')) return 'All badges earned! 🎉';
    if ((stats.badges || []).includes('14-Day Streak')) return 'Aim 30-Day Streak';
    if ((stats.badges || []).includes('7-Day Streak')) return 'Aim 14-Day Streak';
    if ((stats.badges || []).includes('3-Day Streak')) return 'Aim 7-Day Streak';
    return 'Earn 3-Day Streak';
  };

  const challengeProgress = stats.weeklyChallenge?.progress || 0;
  const challengeTarget = stats.weeklyChallenge?.target || 3;
  const challengePercent = Math.min((challengeProgress / challengeTarget) * 100, 100);

  return (
    <div className="home-container bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 min-h-screen">
      <NavBar />
      {!user && (
        <>
          <HeroSection />
          <CallToAction />
          <HowItWorks />
        </>
      )}
      
      {user && (
        <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 min-h-screen">
          {/* Welcome Header with animated gradient */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
              <div className="text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 animate-fade-in">
                  Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300">{user.firstName || 'Fitness Enthusiast'}</span>! 👋
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl">Track your progress and stay motivated on your fitness journey</p>
              </div>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 -mt-8 sm:-mt-12 md:-mt-16 relative z-10">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
              {/* This Week Points */}
              <div className="group bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/50 border border-blue-400/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 sm:p-3 group-hover:bg-white/30 transition-all">
                    <FiTrendingUp className="text-white text-xl sm:text-2xl" />
                  </div>
                  <span className="text-blue-100 text-xs sm:text-sm font-medium px-2 py-1 bg-white/10 rounded-full">This Week</span>
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1">{stats.weeklyPoints || 0}</div>
                <div className="text-blue-100 text-xs sm:text-sm">points earned</div>
              </div>

              {/* All-Time Points */}
              <div className="group bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/50 border border-purple-400/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 sm:p-3 group-hover:bg-white/30 transition-all">
                    <FiAward className="text-white text-xl sm:text-2xl" />
                  </div>
                  <span className="text-purple-100 text-xs sm:text-sm font-medium px-2 py-1 bg-white/10 rounded-full">All-Time</span>
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1">{stats.points || 0}</div>
                <div className="text-purple-100 text-xs sm:text-sm">total points</div>
              </div>

              {/* Streak */}
              <div className="group bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-orange-500/50 border border-orange-400/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 sm:p-3 group-hover:bg-white/30 transition-all">
                    <FiZap className="text-white text-xl sm:text-2xl" />
                  </div>
                  <span className="text-orange-100 text-xs sm:text-sm font-medium px-2 py-1 bg-white/10 rounded-full">Streak</span>
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 flex items-center">
                  {stats.streakCount || 0} <span className="text-2xl sm:text-3xl ml-2 animate-pulse">🔥</span>
                </div>
                <div className="text-orange-100 text-xs sm:text-sm">days in a row</div>
              </div>

              {/* Next Badge */}
              <div className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-green-500/50 border border-green-400/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 sm:p-3 group-hover:bg-white/30 transition-all">
                    <FiTarget className="text-white text-xl sm:text-2xl" />
                  </div>
                  <span className="text-green-100 text-xs sm:text-sm font-medium px-2 py-1 bg-white/10 rounded-full">Next Badge</span>
                </div>
                <div className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 line-clamp-2">{getNextBadge()}</div>
                <div className="text-green-100 text-xs mt-1 sm:mt-2">Keep going!</div>
              </div>
            </div>

            {/* Bottom Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Weekly Challenge */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="flex items-center w-full sm:w-auto">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-2 sm:p-3 mr-3 shadow-lg">
                      <FiActivity className="text-white text-xl sm:text-2xl" />
                    </div>
                    <div className="flex-1 sm:flex-none">
                      <h3 className="text-lg sm:text-xl font-bold text-white">Weekly Challenge</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">Complete to earn bonus points</p>
                    </div>
                  </div>
                  {stats.weeklyChallenge?.completed && (
                    <FiCheckCircle className="text-green-400 text-2xl sm:text-3xl animate-bounce" />
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-white font-semibold mb-3 text-base sm:text-lg">
                    {stats.weeklyChallenge?.title || 'Log 3 workouts this week'}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-xs sm:text-sm">Progress</span>
                    <span className="text-white font-bold text-sm sm:text-base">
                      {challengeProgress}/{challengeTarget} {stats.weeklyChallenge?.completed && '✅'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2 sm:h-3 overflow-hidden backdrop-blur-sm">
                    <div
                      className={`h-full rounded-full transition-all duration-500 shadow-lg ${
                        stats.weeklyChallenge?.completed
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-500/50'
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-orange-500/50'
                      }`}
                      style={{ width: `${challengePercent}%` }}
                    />
                  </div>
                </div>
                {!stats.weeklyChallenge?.completed && (
                  <Link
                    to="/Workout"
                    className="inline-block w-full sm:w-auto text-center mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/50 text-sm sm:text-base"
                  >
                    Start Workout
                  </Link>
                )}
              </div>

              {/* Adherence */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg p-2 sm:p-3 mr-3 shadow-lg">
                    <FiBarChart2 className="text-white text-xl sm:text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Workout Adherence</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Your consistency tracking</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm sm:text-base">This week</span>
                      <span className="text-white font-bold text-base sm:text-lg">{adherence.adherenceThisWeek || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 sm:h-3 overflow-hidden backdrop-blur-sm">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500 shadow-lg shadow-blue-500/50"
                        style={{ width: `${adherence.adherenceThisWeek || 0}%` }}
                      />
                    </div>
                  </div>
                  {(adherence.last4Weeks || []).length > 0 && (
                    <div className="pt-4 border-t border-gray-700/50">
                      <p className="text-gray-400 text-xs sm:text-sm mb-3">Last 4 weeks</p>
                      <div className="space-y-2">
                        {(adherence.last4Weeks || []).slice(0, 4).map((week, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                            <span className="text-gray-300 text-xs sm:text-sm">Week {week.week}</span>
                            <span className="text-white font-medium text-sm sm:text-base">{week.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 sm:mt-8 md:mt-12">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <Link
                  to="/Workout"
                  className="bg-gray-800/40 backdrop-blur-xl hover:bg-gray-700/60 border border-gray-700/50 hover:border-orange-500/50 rounded-xl p-4 sm:p-6 text-center transition-all hover:scale-105 transform shadow-lg hover:shadow-orange-500/20"
                >
                  <div className="text-3xl sm:text-4xl mb-2">💪</div>
                  <div className="text-white font-medium text-sm sm:text-base">Workout</div>
                </Link>
                <Link
                  to="/diet-chart"
                  className="bg-gray-800/40 backdrop-blur-xl hover:bg-gray-700/60 border border-gray-700/50 hover:border-green-500/50 rounded-xl p-4 sm:p-6 text-center transition-all hover:scale-105 transform shadow-lg hover:shadow-green-500/20"
                >
                  <div className="text-3xl sm:text-4xl mb-2">🥗</div>
                  <div className="text-white font-medium text-sm sm:text-base">Diet Chart</div>
                </Link>
                <Link
                  to="/leaderboard"
                  className="bg-gray-800/40 backdrop-blur-xl hover:bg-gray-700/60 border border-gray-700/50 hover:border-yellow-500/50 rounded-xl p-4 sm:p-6 text-center transition-all hover:scale-105 transform shadow-lg hover:shadow-yellow-500/20 col-span-2 sm:col-span-1"
                >
                  <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                  <div className="text-white font-medium text-sm sm:text-base">Leaderboard</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}