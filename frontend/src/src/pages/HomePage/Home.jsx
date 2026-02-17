import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import HomeSec1 from "./HomeSec1";
import HomeSec2 from "./HomeSec2";
import HomeSec3 from "./HomeSec3";
import Footer from "./Footer";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import { FiTrendingUp, FiAward, FiZap, FiTarget, FiCheckCircle, FiActivity, FiBarChart2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useStepCounter } from "../../hooks/useStepCounter";

export default function Home() {
  const user = useSelector(selectUser);
  const [stats, setStats] = useState({ points: 0, weeklyPoints: 0, streakCount: 0, badges: [], weeklyChallenge: {} });
  const [adherence, setAdherence] = useState({ active: false, adherenceThisWeek: 0, last4Weeks: [] });
  const { steps, target: stepTarget, permissionState, startTracking } = useStepCounter();
  const [googleFit, setGoogleFit] = useState({
    loading: false,
    linked: false,
    fitSteps: null,
    lastSyncAt: null,
    error: "",
  });

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

  useEffect(() => {
    async function loadGoogleFitStatus() {
      if (!user?._id) return;
      try {
        setGoogleFit((prev) => ({ ...prev, loading: true, error: "" }));
        const res = await axios.get(`${API_BASE_URL}/api/auth/google-fit/status`, {
          params: { userId: user._id },
        });
        setGoogleFit((prev) => ({
          ...prev,
          loading: false,
          linked: !!res.data?.linked,
          lastSyncAt: res.data?.lastSyncAt || null,
          // keep fitSteps as-is until user explicitly syncs
        }));
      } catch (e) {
        setGoogleFit((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load Google Fit status",
        }));
      }
    }
    loadGoogleFitStatus();
  }, [user?._id]);

  const linkGoogleFit = () => {
    if (!user?._id) return;
    // Opens Google OAuth consent screen and returns to /home
    window.location.href = `${API_BASE_URL}/api/auth/google-fit/link?userId=${encodeURIComponent(
      user._id
    )}`;
  };

  const syncGoogleFitSteps = async () => {
    if (!user?._id) return;
    try {
      setGoogleFit((prev) => ({ ...prev, loading: true, error: "" }));
      const res = await axios.get(`${API_BASE_URL}/api/auth/google-fit/steps/today`, {
        params: { userId: user._id },
      });
      setGoogleFit((prev) => ({
        ...prev,
        loading: false,
        linked: true,
        fitSteps: typeof res.data?.steps === "number" ? res.data.steps : null,
        lastSyncAt: new Date().toISOString(),
      }));
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.details ||
        "Failed to sync steps from Google Fit";
      setGoogleFit((prev) => ({ ...prev, loading: false, error: msg }));
    }
  };

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
  const displaySteps =
    googleFit.linked && typeof googleFit.fitSteps === "number"
      ? googleFit.fitSteps
      : steps;
  const stepSourceLabel =
    googleFit.linked && typeof googleFit.fitSteps === "number"
      ? "Google Fit"
      : "Motion sensor (in-app)";

  return (
    <div className={`min-h-screen flex flex-col ${
      !user ? 'bg-[#05010d]' : 'bg-[#020617]'
    }`}>
      <NavBar />
      {!user && (
        <>
          <HomeSec1 />
          <HomeSec2 />
          <HomeSec3 />
        </>
      )}
      
      {user && (
        <main className="flex-grow">
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          {/* Background blobs - same as Features */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
          </div>

          {/* Welcome Header - Features style */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mb-6 sm:mb-8 lg:mb-10">
            <header className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4">
                <span className="text-xs sm:text-sm font-semibold text-gray-100">
                  Your dashboard
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 text-white">
                Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">{user.firstName || 'Fitness Enthusiast'}</span>! 👋
              </h1>
              <p className="max-w-3xl text-sm sm:text-base lg:text-lg text-gray-300">Track your progress and stay motivated on your fitness journey.</p>
            </header>
          </div>

          {/* Stats Dashboard - Features style cards */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
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

            {/* Daily Steps Tracker */}
            <div className="mt-4 sm:mt-6 md:mt-8">
              <div className="bg-[#020617]/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_18px_45px_rgba(15,23,42,0.8)] border border-[#1F2937] hover:border-emerald-500/60 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg p-2 sm:p-3 shadow-lg">
                    <FiActivity className="text-white text-xl sm:text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Daily Steps
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Target: {stepTarget.toLocaleString()} steps
                    </p>
                    <p className="text-emerald-300 text-sm sm:text-base font-semibold mt-1">
                      {displaySteps.toLocaleString()} steps today
                    </p>
                    <p className="text-gray-400 text-[11px] mt-1">
                      Source: {stepSourceLabel}
                    </p>
                  </div>
                </div>
                <div className="flex-1 md:max-w-sm space-y-2">
                  <div className="w-full bg-[#020617]/60 rounded-full h-2 sm:h-3 overflow-hidden border border-[#1F2937]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 transition-all duration-500 shadow-lg shadow-emerald-500/40"
                      style={{
                        width: `${Math.min(
                          (displaySteps / stepTarget) * 100 || 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {!googleFit.linked && (
                      <button
                        onClick={linkGoogleFit}
                        className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all border border-white/15"
                        disabled={googleFit.loading}
                      >
                        {googleFit.loading ? "Loading..." : "Link Google Fit"}
                      </button>
                    )}
                    {googleFit.linked && (
                      <button
                        onClick={syncGoogleFitSteps}
                        className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all border border-white/15"
                        disabled={googleFit.loading}
                      >
                        {googleFit.loading ? "Syncing..." : "Sync Google Fit"}
                      </button>
                    )}
                    {permissionState !== "granted" && (
                      <button
                        onClick={startTracking}
                        className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-md hover:shadow-emerald-500/40"
                      >
                        {permissionState === "denied"
                          ? "Motion denied – try again"
                          : permissionState === "unsupported"
                          ? "Motion not supported"
                          : "Enable motion"}
                      </button>
                    )}
                  </div>

                  {googleFit.error && (
                    <p className="text-[11px] text-red-300">{googleFit.error}</p>
                  )}

                  {googleFit.linked && (
                    <p className="text-[11px] text-gray-400">
                      {googleFit.lastSyncAt
                        ? `Last synced: ${new Date(googleFit.lastSyncAt).toLocaleString()}`
                        : "Linked to Google Fit (not synced yet)"}
                    </p>
                  )}

                  {permissionState === "granted" && !googleFit.linked && (
                    <p className="text-[11px] text-gray-400">
                      Tracking steps using your phone&apos;s motion sensors while
                      the app is open.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Weekly Challenge - Features style */}
              <div className="relative rounded-xl sm:rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-4 sm:p-6 md:p-8 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
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
                  <div className="w-full bg-[#020617]/60 rounded-full h-2 sm:h-3 overflow-hidden border border-[#1F2937]">
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
                    className="inline-block w-full sm:w-auto text-center mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white rounded-lg font-medium hover:opacity-95 transition-all transform hover:scale-105 shadow-lg hover:shadow-[#8B5CF6]/40 text-sm sm:text-base"
                  >
                    Start Workout
                  </Link>
                )}
              </div>

              {/* Adherence - Features style */}
              <div className="relative rounded-xl sm:rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-4 sm:p-6 md:p-8 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
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
                    <div className="w-full bg-[#020617]/60 rounded-full h-2 sm:h-3 overflow-hidden border border-[#1F2937]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] transition-all duration-500 shadow-lg"
                        style={{ width: `${adherence.adherenceThisWeek || 0}%` }}
                      />
                    </div>
                  </div>
                  {(adherence.last4Weeks || []).length > 0 && (
                    <div className="pt-4 border-t border-[#1F2937]">
                      <p className="text-gray-400 text-xs sm:text-sm mb-3">Last 4 weeks</p>
                      <div className="space-y-2">
                        {(adherence.last4Weeks || []).slice(0, 4).map((week, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#020617]/60 border border-[#1F2937] hover:border-[#22D3EE]/40 transition-colors">
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

            {/* Quick Actions - Features style */}
            <div className="mt-6 sm:mt-8 md:mt-12">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <Link
                  to="/Workout"
                  className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl hover:border-[#22D3EE]/60 p-4 sm:p-6 text-center transition-all hover:scale-105 transform shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:shadow-[#22D3EE]/20"
                >
                  <div className="text-3xl sm:text-4xl mb-2">💪</div>
                  <div className="text-white font-medium text-sm sm:text-base">Workout</div>
                </Link>
                <Link
                  to="/diet-chart"
                  className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl hover:border-[#22D3EE]/60 p-4 sm:p-6 text-center transition-all hover:scale-105 transform shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:shadow-[#22D3EE]/20"
                >
                  <div className="text-3xl sm:text-4xl mb-2">🥗</div>
                  <div className="text-white font-medium text-sm sm:text-base">Diet Chart</div>
                </Link>
                <Link
                  to="/leaderboard"
                  className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl hover:border-[#22D3EE]/60 p-4 sm:p-6 text-center transition-all hover:scale-105 transform shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:shadow-[#22D3EE]/20 col-span-2 sm:col-span-1"
                >
                  <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                  <div className="text-white font-medium text-sm sm:text-base">Leaderboard</div>
                </Link>
              </div>
            </div>
          </div>
        </section>
        </main>
      )}

      <Footer />
    </div>
  );
}