import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, Dumbbell, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { API_BASE_URL } from "../../../config/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
          headers: { email: user.email }
        });
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-20 text-xl font-bold">Loading dashboard...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;

  const COLORS = ['#22D3EE', '#8B5CF6']; // Cyan for Free, Purple for Pro

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-gray-400 mt-1">Metrics and analytics for GenFit AI.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={<Users size={24} className="text-[#22D3EE]" />} 
          bgColor="bg-[#22D3EE]/10"
        />
        <StatCard 
          title="Pro Users" 
          value={stats?.proUsers || 0} 
          icon={<Shield size={24} className="text-[#8B5CF6]" />} 
          bgColor="bg-[#8B5CF6]/10"
        />
        <StatCard 
          title="Workouts Logged" 
          value={stats?.totalWorkouts || 0} 
          icon={<Dumbbell size={24} className="text-yellow-400" />} 
          bgColor="bg-yellow-400/10"
        />
        <StatCard 
          title="Posture Sessions" 
          value={stats?.totalPostureSessions || 0} 
          icon={<Activity size={24} className="text-pink-500" />} 
          bgColor="bg-pink-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Breakdown Chart */}
        <div className="bg-[#0c0520]/40 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 lg:col-span-1 shadow-[0_0_15px_rgba(139,92,246,0.08)]">
          <h2 className="text-xl font-bold mb-4 text-white">User Plan Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.planBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats?.planBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c0520', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Users List */}
        <div className="bg-[#0c0520]/40 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 lg:col-span-2 shadow-[0_0_15px_rgba(139,92,246,0.08)]">
          <h2 className="text-xl font-bold mb-4 text-white">Recent Registrations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="py-3 px-4 font-semibold text-gray-400">Name</th>
                  <th className="py-3 px-4 font-semibold text-gray-400">Email</th>
                  <th className="py-3 px-4 font-semibold text-gray-400">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-gray-200">
                {stats?.recentUsers?.map((u) => (
                  <tr key={u._id} className="hover:bg-purple-500/5 transition-all font-sans">
                    <td className="py-3 px-4 font-medium">{u.firstName} {u.lastName}</td>
                    <td className="py-3 px-4 text-gray-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        u.plan === 'pro' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-[#22D3EE]/20 text-[#22D3EE]'
                      }`}>
                        {u.plan.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor }) => (
  <div className="bg-[#0c0520]/40 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 flex items-center justify-between shadow-lg shadow-black/20 hover:border-purple-500/40 transition-all cursor-pointer">
    <div>
      <p className="text-gray-400 font-medium text-sm">{title}</p>
      <h3 className="text-3xl font-extrabold mt-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${bgColor}`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
