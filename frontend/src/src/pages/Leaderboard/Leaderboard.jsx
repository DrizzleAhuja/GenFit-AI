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
  const [activeTab, setActiveTab] = useState('weekly');

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
      <div 
        className={`leaderboard-row group relative overflow-hidden ${
          isCurrentUser ? 'current-user-row' : ''
        }`}
        style={{ animationDelay: `${i * 50}ms` }}
      >
        {/* Rank Badge */}
        <div className="flex items-center gap-4">
          <div className={`rank-badge ${
            i === 0 ? 'rank-1' :
            i === 1 ? 'rank-2' :
            i === 2 ? 'rank-3' :
            isCurrentUser ? 'rank-current' :
            'rank-normal'
          }`}>
            {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
          </div>
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-white truncate">
                {u.firstName || 'User'} {u.lastName || ''}
              </div>
              {isCurrentUser && (
                <span className="you-badge">
                  <span className="relative z-10">You</span>
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 truncate">{u.email}</div>
          </div>

          {/* Points */}
          <div className="points-display">
            <div className="text-2xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {points}
            </div>
            <div className="text-xs text-gray-400 font-medium">points</div>
          </div>
        </div>

        {/* Animated Background for Current User */}
        {isCurrentUser && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 animate-gradient -z-10"></div>
        )}
        
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
      </div>
    );
  };

  return (
    <div className="dark">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .leaderboard-row {
          position: relative;
          padding: 1.25rem;
          margin-bottom: 0.75rem;
          border-radius: 1rem;
          background: rgba(31, 41, 55, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(75, 85, 99, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .leaderboard-row:hover {
          transform: translateY(-2px);
          border-color: rgba(96, 165, 250, 0.5);
          box-shadow: 0 10px 30px -10px rgba(96, 165, 250, 0.3);
        }

        .current-user-row {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
          border: 2px solid rgba(16, 185, 129, 0.4);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
        }

        .current-user-row:hover {
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.3);
        }

        .rank-badge {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.125rem;
          transition: all 0.3s ease;
          position: relative;
          z-index: 10;
        }

        .rank-1 {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #7C2D12;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          animation: pulse 2s ease-in-out infinite;
        }

        .rank-2 {
          background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
          color: #1F2937;
          box-shadow: 0 0 15px rgba(192, 192, 192, 0.4);
        }

        .rank-3 {
          background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
          color: #7C2D12;
          box-shadow: 0 0 15px rgba(205, 127, 50, 0.4);
        }

        .rank-current {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
        }

        .rank-normal {
          background: linear-gradient(135deg, #4B5563 0%, #374151 100%);
          color: #D1D5DB;
        }

        .you-badge {
          position: relative;
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          overflow: hidden;
        }

        .you-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        .points-display {
          text-align: right;
          min-width: 80px;
        }

        .stat-card {
          position: relative;
          background: rgba(31, 41, 55, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: rgba(96, 165, 250, 0.5);
          box-shadow: 0 20px 40px -15px rgba(96, 165, 250, 0.3);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          transition: left 0.5s;
        }

        .stat-card:hover::before {
          left: 100%;
        }

        .stat-card-1 { animation-delay: 0.1s; opacity: 0; }
        .stat-card-2 { animation-delay: 0.2s; opacity: 0; }
        .stat-card-3 { animation-delay: 0.3s; opacity: 0; }

        .info-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid rgba(139, 92, 246, 0.3);
          animation: fadeInUp 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }

        .info-item {
          background: rgba(31, 41, 55, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 0.75rem;
          padding: 1rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
          transition: all 0.3s ease;
        }

        .info-item:hover {
          background: rgba(31, 41, 55, 0.8);
          transform: translateX(5px);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .leaderboard-section {
          background: rgba(31, 41, 55, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
          animation: fadeInUp 0.6s ease-out 0.5s forwards;
          opacity: 0;
        }

        .tab-button {
          position: relative;
          padding: 0.75rem 2rem;
          font-weight: 600;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
          background: transparent;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
        }

        .tab-button.active {
          color: white;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .tab-button:not(.active):hover {
          color: white;
          background: rgba(75, 85, 99, 0.5);
        }

        .title-gradient {
          background: linear-gradient(135deg, #60A5FA 0%, #A78BFA 50%, #F472B6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }

        .scroll-container {
          max-height: 600px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .scroll-container::-webkit-scrollbar {
          width: 8px;
        }

        .scroll-container::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }

        .scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          border-radius: 10px;
        }

        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }
      `}</style>

      <NavBar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4 title-gradient">
              🏆 Leaderboard
            </h1>
            <p className="text-gray-400 text-lg">Compete, Track, and Dominate Your Fitness Journey</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="stat-card stat-card-1">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">This Week</div>
                <div className="text-3xl">📅</div>
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                {stats.weeklyPoints || 0}
              </div>
              <div className="text-sm text-gray-400">Points earned this week</div>
              <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats.weeklyPoints || 0) / 100 * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-card stat-card-2">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">All-Time</div>
                <div className="text-3xl">💎</div>
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-2">
                {stats.points || 0}
              </div>
              <div className="text-sm text-gray-400">Total lifetime points</div>
              <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats.points || 0) / 500 * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-card stat-card-3">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Streak</div>
                <div className="text-3xl">🔥</div>
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
                {stats.streakCount || 0}
              </div>
              <div className="text-sm text-gray-400">Consecutive days active</div>
              <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats.streakCount || 0) / 30 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Points Info Card */}
          <div className="info-card mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">💡</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                How to Earn Points
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="info-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📊</div>
                    <span className="text-gray-200 font-medium">BMI Save/Update</span>
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    +10
                  </span>
                </div>
              </div>
              <div className="info-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💪</div>
                    <span className="text-gray-200 font-medium">Workout Plan Generated</span>
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                    +20
                  </span>
                </div>
              </div>
              <div className="info-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✅</div>
                    <span className="text-gray-200 font-medium">Workout Day Completed</span>
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    +20
                  </span>
                </div>
              </div>
              <div className="info-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🥗</div>
                    <span className="text-gray-200 font-medium">Diet Chart Generated</span>
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
                    +20
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Tables */}
          <div className="leaderboard-section">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 justify-center">
              <button 
                className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`}
                onClick={() => setActiveTab('weekly')}
              >
                📅 Weekly Leaders
              </button>
              <button 
                className={`tab-button ${activeTab === 'alltime' ? 'active' : ''}`}
                onClick={() => setActiveTab('alltime')}
              >
                👑 All-Time Champions
              </button>
            </div>

            {/* Leaderboard Content */}
            <div className="scroll-container">
              {activeTab === 'weekly' ? (
                weekly.length > 0 ? (
                  weekly.map((u, i) => <Row key={u._id || i} u={u} i={i} weeklyMode />)
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-xl">No weekly data available yet</p>
                    <p className="text-sm mt-2">Start earning points to appear on the leaderboard!</p>
                  </div>
                )
              ) : (
                allTime.length > 0 ? (
                  allTime.map((u, i) => <Row key={u._id || i} u={u} i={i} />)
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <p className="text-xl">No all-time data available yet</p>
                    <p className="text-sm mt-2">Be the first to earn points!</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}