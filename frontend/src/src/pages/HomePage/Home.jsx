import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import HeroSection from "./HeroSection";
import Section2 from "./Section2";
import CallToAction from "./CallToAction"; // Import the new CTA component
import HowItWorks from "./HowItWorks"; // Import the new HowItWorks component
import Footer from "./Footer";
// import NotificationsPage from "../NotificationsPage/Section1";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";

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

  return (
    <div className="home-container">
      <NavBar />
      <HeroSection />
      {/* <Section2 /> */}
      <CallToAction /> {/* Add the CallToAction component here */}
      <HowItWorks /> {/* Add the HowItWorks component here */}
      {user && (
        <div className="px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-300">This Week</div>
              <div className="text-3xl font-bold text-white">{stats.weeklyPoints || 0}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-300">All-Time</div>
              <div className="text-3xl font-bold text-white">{stats.points || 0}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-300">Streak</div>
              <div className="text-3xl font-bold text-white">{stats.streakCount || 0} 🔥</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-300">Next Badge</div>
              <div className="text-white">{(stats.badges || []).includes('7-Day Streak') ? 'Aim 14-Day Streak' : (stats.badges || []).includes('3-Day Streak') ? 'Aim 7-Day Streak' : 'Earn 3-Day Streak'}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-300 mb-2">Weekly Challenge</div>
              <div className="text-white font-semibold">{stats.weeklyChallenge?.title || 'Log 3 workouts this week'}</div>
              <div className="text-gray-300 mt-1">{stats.weeklyChallenge?.progress || 0}/{stats.weeklyChallenge?.target || 3} {stats.weeklyChallenge?.completed ? '✅' : ''}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-300 mb-2">Adherence</div>
              <div className="text-white font-semibold">This week: {adherence.adherenceThisWeek || 0}%</div>
              <div className="text-gray-300 mt-1">Last weeks: {(adherence.last4Weeks || []).map(w => `${w.week}:${w.percent}%`).join('  ')}</div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
