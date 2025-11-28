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
    <div className="home-container bg-gray-900 min-h-screen">
      <NavBar />
      {!user && (
        <>
      <HeroSection />
          <CallToAction />
          <HowItWorks />
        </>
      )}
      
      {user && (
        <div className="bg-gray-900 min-h-screen">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {user.firstName || 'Fitness Enthusiast'}! 👋
              </h1>
              <p className="text-lg text-orange-100">Track your progress and stay motivated on your fitness journey</p>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* This Week Points */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <FiTrendingUp className="text-white text-2xl" />
                  </div>
                  <span className="text-blue-200 text-sm font-medium">This Week</span>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">{stats.weeklyPoints || 0}</div>
                <div className="text-blue-200 text-sm">points earned</div>
              </div>

              {/* All-Time Points */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <FiAward className="text-white text-2xl" />
                  </div>
                  <span className="text-purple-200 text-sm font-medium">All-Time</span>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">{stats.points || 0}</div>
                <div className="text-purple-200 text-sm">total points</div>
              </div>

              {/* Streak */}
              <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <FiZap className="text-white text-2xl" />
                  </div>
                  <span className="text-orange-200 text-sm font-medium">Streak</span>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-1 flex items-center">
                  {stats.streakCount || 0} <span className="text-3xl ml-2">🔥</span>
                </div>
                <div className="text-orange-200 text-sm">days in a row</div>
              </div>

              {/* Next Badge */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <FiTarget className="text-white text-2xl" />
                  </div>
                  <span className="text-green-200 text-sm font-medium">Next Badge</span>
                </div>
                <div className="text-lg md:text-xl font-bold text-white mb-1">{getNextBadge()}</div>
                <div className="text-green-200 text-xs mt-2">Keep going!</div>
              </div>
            </div>

            {/* Bottom Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Weekly Challenge */}
              <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-3 mr-3">
                      <FiActivity className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Weekly Challenge</h3>
                      <p className="text-gray-400 text-sm">Complete to earn bonus points</p>
                    </div>
                  </div>
                  {stats.weeklyChallenge?.completed && (
                    <FiCheckCircle className="text-green-500 text-3xl" />
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-white font-semibold mb-3 text-lg">
                    {stats.weeklyChallenge?.title || 'Log 3 workouts this week'}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Progress</span>
                    <span className="text-white font-bold">
                      {challengeProgress}/{challengeTarget} {stats.weeklyChallenge?.completed && '✅'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.weeklyChallenge?.completed
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      }`}
                      style={{ width: `${challengePercent}%` }}
                    />
                  </div>
                </div>
                {!stats.weeklyChallenge?.completed && (
                  <Link
                    to="/Workout"
                    className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-colors"
                  >
                    Start Workout
                  </Link>
                )}
              </div>

              {/* Adherence */}
              <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-3 mr-3">
                    <FiBarChart2 className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Workout Adherence</h3>
                    <p className="text-gray-400 text-sm">Your consistency tracking</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">This week</span>
                      <span className="text-white font-bold text-lg">{adherence.adherenceThisWeek || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${adherence.adherenceThisWeek || 0}%` }}
                      />
                    </div>
                  </div>
                  {(adherence.last4Weeks || []).length > 0 && (
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-3">Last 4 weeks</p>
                      <div className="space-y-2">
                        {(adherence.last4Weeks || []).slice(0, 4).map((week, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Week {week.week}</span>
                            <span className="text-white font-medium">{week.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 md:mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link
                  to="/Workout"
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 text-center transition-all hover:scale-105"
                >
                  <div className="text-2xl mb-2">💪</div>
                  <div className="text-white font-medium">Workout</div>
                </Link>
                <Link
                  to="/diet-chart"
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 text-center transition-all hover:scale-105"
                >
                  <div className="text-2xl mb-2">🥗</div>
                  <div className="text-white font-medium">Diet Chart</div>
                </Link>
                <Link
                  to="/leaderboard"
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 text-center transition-all hover:scale-105"
                >
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-white font-medium">Leaderboard</div>
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
