import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { useTheme } from '../../context/ThemeContext';

export default function Leaderboard() {
  const { darkMode } = useTheme();
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
    
    // Streak logic - we check if user has streak count. If current user, we fallback to stats.
    const userStreak = isCurrentUser ? (stats.streakCount || 0) : (u.streakCount || 0);

    return (
      <div 
        className={`leaderboard-row group relative overflow-hidden ${
          isCurrentUser ? 'current-user-row' : ''
        }`}
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
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <div className="font-bold text-white truncate max-w-[150px] sm:max-w-xs">
                {u.firstName || 'User'} {u.lastName || ''}
              </div>
              {isCurrentUser && (
                <span className="you-badge shrink-0">
                  <span className="relative z-10">You</span>
                </span>
              )}

              {/* Badges Section */}
              <div className="flex flex-wrap items-center gap-1.5 ml-1">
                {i === 0 && (
                  <span className="flexitems-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]" title="Top Performer">
                    🥇 Top
                  </span>
                )}
                {i > 0 && i < 10 && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-gray-300/20 text-gray-200 border border-gray-400/50" title="Elite Squad (Top 10)">
                    🥈 Top 10
                  </span>
                )}
                {i >= 10 && i < 50 && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/50" title="Rising Star (Top 50)">
                    🥉 Top 50
                  </span>
                )}
                {userStreak >= 7 && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]" title="Consistent Beast (7+ Day Streak)">
                    🔥 Beast
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-400 truncate">{u.email}</div>
          </div>

          {/* Points */}
          <div className="points-display">
            <div className="text-2xl font-black bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
              {points}
            </div>
            <div className="text-xs text-gray-400 font-medium">points</div>
          </div>
        </div>

        {/* Animated Background for Current User */}
        {isCurrentUser && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 via-[#A855F7]/10 to-[#22D3EE]/10 -z-10"></div>
        )}
        
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 -z-10"></div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      darkMode ? 'bg-[#05010d] text-white' : 'bg-[#020617] text-gray-100'
    }`}>
      <style>{`
        .dynamic-feedback-banner {
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
          border: 1px solid rgba(34, 211, 238, 0.4);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(34, 211, 238, 0.1);
          animation: pulse-border 2.5s infinite;
        }
        
        @keyframes pulse-border {
          0% { border-color: rgba(34, 211, 238, 0.2); box-shadow: 0 4px 20px rgba(34, 211, 238, 0.1); }
          50% { border-color: rgba(139, 92, 246, 0.8); box-shadow: 0 4px 30px rgba(139, 92, 246, 0.3); }
          100% { border-color: rgba(34, 211, 238, 0.2); box-shadow: 0 4px 20px rgba(34, 211, 238, 0.1); }
        }

        .dynamic-feedback-banner.top-performer {
          background: linear-gradient(135deg, rgba(250, 204, 21, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%);
          animation: pulse-gold 2.5s infinite;
        }

        @keyframes pulse-gold {
          0% { border-color: rgba(250, 204, 21, 0.2); box-shadow: 0 4px 20px rgba(250, 204, 21, 0.1); }
          50% { border-color: rgba(250, 204, 21, 0.8); box-shadow: 0 4px 30px rgba(250, 204, 21, 0.3); }
          100% { border-color: rgba(250, 204, 21, 0.2); box-shadow: 0 4px 20px rgba(250, 204, 21, 0.1); }
        }

        .leaderboard-row {
          position: relative;
          padding: 1.25rem;
          margin-bottom: 0.75rem;
          border-radius: 1rem;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid #1F2937;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.8);
        }

        .leaderboard-row:hover {
          border-color: rgba(34, 211, 238, 0.5);
        }

        .current-user-row {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(34, 211, 238, 0.15) 100%);
          border: 2px solid rgba(34, 211, 238, 0.5);
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.25);
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
          position: relative;
          z-index: 10;
        }

        .rank-1 {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #7C2D12;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
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
          background: linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%);
          color: white;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
        }

        .rank-normal {
          background: rgba(2, 6, 23, 0.9);
          border: 1px solid #1F2937;
          color: #D1D5DB;
        }

        .you-badge {
          position: relative;
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
        }

        .points-display {
          text-align: right;
          min-width: 80px;
        }

        .stat-card {
          position: relative;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid #1F2937;
          overflow: hidden;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.8);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          border-radius: 1.5rem 1.5rem 0 0;
          background: linear-gradient(90deg, #8B5CF6, #A855F7, #22D3EE);
          z-index: 1;
        }

        .info-card {
          position: relative;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid #1F2937;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.8);
        }

        .info-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          border-radius: 1.5rem 1.5rem 0 0;
          background: linear-gradient(90deg, #8B5CF6, #A855F7, #22D3EE);
          z-index: 1;
        }

        .info-item {
          background: rgba(2, 6, 23, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 0.75rem;
          padding: 1rem;
          border: 1px solid #1F2937;
        }

        .leaderboard-section {
          position: relative;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid #1F2937;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.8);
        }

        .leaderboard-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          border-radius: 1.5rem 1.5rem 0 0;
          background: linear-gradient(90deg, #8B5CF6, #A855F7, #22D3EE);
          z-index: 1;
        }

        .tab-button {
          position: relative;
          padding: 0.75rem 2rem;
          font-weight: 600;
          border-radius: 0.75rem;
          background: transparent;
          border: 1px solid #1F2937;
          color: #9CA3AF;
          cursor: pointer;
        }

        .tab-button:hover {
          border-color: rgba(34, 211, 238, 0.5);
          color: white;
        }

        .tab-button.active {
          color: white;
          background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #22D3EE 100%);
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.35);
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
          background: rgba(2, 6, 23, 0.5);
          border-radius: 10px;
        }

        .scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%);
          border-radius: 10px;
        }
      `}</style>

      <NavBar />
      
      <main className="flex-grow">
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          {/* Background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Header */}
            <header className="text-center mb-10 sm:mb-14 lg:mb-16">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4">
                <span className="text-xs sm:text-sm font-semibold text-gray-100">
                  🏆 Competition & Rankings
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
                  Leaderboard
                </span>
              </h1>

              <p className="max-w-3xl mx-auto text-sm sm:text-base lg:text-lg text-gray-300">
                Compete, track, and dominate your fitness journey. See where you rank among GenFit AI users.
              </p>
            </header>

            {/* Dynamic Feedback Banner */}
            {user?.email && (
              <div className="mb-8">
                {(() => {
                  const list = activeTab === 'weekly' ? weekly : allTime;
                  const userIndex = list.findIndex(u => u.email === user.email);
                  
                  if (userIndex === -1) return (
                    <div className="dynamic-feedback-banner text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
                        <span className="text-4xl sm:text-3xl">🚀</span>
                        <div>
                          <div className="font-bold text-xl text-white">Join the Ranks!</div>
                          <div className="text-gray-300">Complete workouts and log your BMI to get on the leaderboard!</div>
                        </div>
                      </div>
                    </div>
                  );

                  if (userIndex === 0) return (
                    <div className="dynamic-feedback-banner top-performer text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
                        <span className="text-4xl sm:text-3xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">👑</span>
                        <div>
                          <div className="font-bold text-xl text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">Top Performer</div>
                          <div className="text-yellow-100">You are Rank #1! Keep up the great work to defend your title!</div>
                        </div>
                      </div>
                    </div>
                  );

                  const currentUserScore = activeTab === 'weekly' ? (list[userIndex].weeklyPoints || 0) : (list[userIndex].points || 0);
                  const userAbove = list[userIndex - 1];
                  const userAboveScore = activeTab === 'weekly' ? (userAbove.weeklyPoints || 0) : (userAbove.points || 0);
                  const pointsNeeded = userAboveScore - currentUserScore + 1;
                  
                  // Check close to top 10 or top 50
                  let milestoneMsg = "";
                  if (userIndex > 0 && userIndex <= 9) {
                     // Inside top 10
                     milestoneMsg = `You are #${userIndex + 1}! Just ONE spot away from top ${userIndex}.`;
                  } else if (userIndex > 9 && list[9]) {
                     const top10User = list[9];
                     const top10Score = activeTab === 'weekly' ? (top10User.weeklyPoints || 0) : (top10User.points || 0);
                     const pointsToTop10 = top10Score - currentUserScore + 1;
                     if (pointsToTop10 > 0 && pointsToTop10 <= 100) {
                        milestoneMsg = `You are #${userIndex + 1}, just ${pointsToTop10} points away from the Elite Squad (Top 10)!`;
                     }
                  } else if (userIndex >= 50 && list[49]) {
                     const top50User = list[49];
                     const top50Score = activeTab === 'weekly' ? (top50User.weeklyPoints || 0) : (top50User.points || 0);
                     const pointsToTop50 = top50Score - currentUserScore + 1;
                     if (pointsToTop50 > 0 && pointsToTop50 <= 100) {
                        milestoneMsg = `You are #${userIndex + 1}, just ${pointsToTop50} points away from the Rising Star (Top 50) badge!`;
                     }
                  }
                  
                  const workoutsNeeded = Math.ceil(pointsNeeded / 20);
                  const nameAbove = userAbove.firstName || 'the next user';

                  return (
                    <div className="dynamic-feedback-banner text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
                        <span className="text-4xl sm:text-3xl drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">🔥</span>
                        <div>
                          <div className="font-bold text-xl text-white mb-1">Target Acquired!</div>
                          <div className="text-gray-200">
                            {milestoneMsg ? (
                              <span className="font-medium text-cyan-300">{milestoneMsg} </span>
                            ) : null}
                            Overtake <span className="font-bold text-purple-400">{nameAbove}</span> by earning {pointsNeeded} points. 
                            (Just <span className="font-bold text-cyan-400">{workoutsNeeded} workout{workoutsNeeded > 1 ? 's' : ''}</span>!)
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="stat-card stat-card-1">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">This Week</div>
                <div className="text-3xl">📅</div>
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent mb-2">
                {stats.weeklyPoints || 0}
              </div>
              <div className="text-sm text-gray-400">Points earned this week</div>
              <div className="mt-4 h-2 bg-[#020617]/60 rounded-full overflow-hidden border border-[#1F2937]">
                <div 
                  className="h-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] rounded-full"
                  style={{ width: `${Math.min((stats.weeklyPoints || 0) / 100 * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-card stat-card-2">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">All-Time</div>
                <div className="text-3xl">💎</div>
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent mb-2">
                {stats.points || 0}
              </div>
              <div className="text-sm text-gray-400">Total lifetime points</div>
              <div className="mt-4 h-2 bg-[#020617]/60 rounded-full overflow-hidden border border-[#1F2937]">
                <div 
                  className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] rounded-full"
                  style={{ width: `${Math.min((stats.points || 0) / 500 * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-card stat-card-3">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Streak</div>
                <div className="text-3xl">🔥</div>
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-[#FACC15] to-[#F97316] bg-clip-text text-transparent mb-2">
                {stats.streakCount || 0}
              </div>
              <div className="text-sm text-gray-400">Consecutive days active</div>
              <div className="mt-4 h-2 bg-[#020617]/60 rounded-full overflow-hidden border border-[#1F2937]">
                <div 
                  className="h-full bg-gradient-to-r from-[#FACC15] to-[#F97316] rounded-full"
                  style={{ width: `${Math.min((stats.streakCount || 0) / 30 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Points Info Card */}
          <div className="info-card mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">💡</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] bg-clip-text text-transparent">
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
                  <span className="text-2xl font-black bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
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
                  <span className="text-2xl font-black bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
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
                  <span className="text-2xl font-black bg-gradient-to-r from-[#FACC15] to-[#F97316] bg-clip-text text-transparent">
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
                  <span className="text-2xl font-black bg-gradient-to-r from-[#A855F7] to-[#22D3EE] bg-clip-text text-transparent">
                    +20
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards & Badges Info */}
          <div className="info-card mb-12 border-t-4 border-t-yellow-500/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🏅</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
                Rank-Based Rewards & Badges
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="info-item relative overflow-hidden group border border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-500/60 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-50"></div>
                <div className="relative flex flex-col gap-2 p-1">
                  <div className="text-4xl mb-1 drop-shadow-lg group-hover:scale-110 transition-transform origin-left">🥇</div>
                  <span className="text-white font-bold text-lg">Top Performer</span>
                  <p className="text-sm text-yellow-200/80 leading-snug">Rank #1 • Gold Badge + Bonus Points</p>
                </div>
              </div>
              
              <div className="info-item relative overflow-hidden group border border-gray-400/30 bg-gray-400/10 hover:border-gray-400/60 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300/20 to-transparent opacity-50"></div>
                <div className="relative flex flex-col gap-2 p-1">
                  <div className="text-4xl mb-1 drop-shadow-lg group-hover:scale-110 transition-transform origin-left">🥈</div>
                  <span className="text-white font-bold text-lg">Elite Squad</span>
                  <p className="text-sm text-gray-300/80 leading-snug">Rank #2-10 • Silver Badge</p>
                </div>
              </div>
              
              <div className="info-item relative overflow-hidden group border border-amber-700/40 bg-amber-700/10 hover:border-amber-600/60 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent opacity-50"></div>
                <div className="relative flex flex-col gap-2 p-1">
                  <div className="text-4xl mb-1 drop-shadow-lg group-hover:scale-110 transition-transform origin-left">🥉</div>
                  <span className="text-white font-bold text-lg">Rising Star</span>
                  <p className="text-sm text-amber-500/90 leading-snug">Top 50 • Bronze Badge</p>
                </div>
              </div>
              
              <div className="info-item relative overflow-hidden group border border-orange-500/30 bg-orange-500/10 hover:border-orange-500/60 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-50"></div>
                <div className="relative flex flex-col gap-2 p-1">
                  <div className="text-4xl mb-1 drop-shadow-lg group-hover:scale-110 transition-transform origin-left">🔥</div>
                  <span className="text-white font-bold text-lg">Consistent Beast</span>
                  <p className="text-sm text-orange-300/80 leading-snug">7-Day Active Streak Maintained</p>
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
        </section>
      </main>
      
      <Footer />
    </div>
  );
}