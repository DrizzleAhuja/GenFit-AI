import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../../../config/api";
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Income() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await axios.get(`${API_BASE_URL}/api/admin/income`, {
          headers: { email: user.email }
        });
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch income stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncome();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400 font-bold">Loading Financials...</div>;

  const chartData = stats?.chartData || [{ month: 'N/A', revenue: 0 }];


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
          Financial Overview
        </h1>
        <p className="text-gray-400 mt-1">Track revenue, subscriptions, and payouts streams correctly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Estimated Monthly Revenue" 
          value={`₹${stats?.estimatedMonthlyIncome || 0}`} 
          icon={<DollarSign size={24} className="text-[#22D3EE]" />} 
          bgColor="bg-[#22D3EE]/10"
        />
        <StatCard 
          title="Pro Subscriptions" 
          value={stats?.proUsers || 0} 
          icon={<CreditCard size={24} className="text-[#8B5CF6]" />} 
          bgColor="bg-[#8B5CF6]/10"
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${stats?.totalUsers ? Math.round((stats.proUsers / stats.totalUsers) * 100) : 0}%`} 
          icon={<TrendingUp size={24} className="text-emerald-400" />} 
          bgColor="bg-emerald-400/10"
        />
      </div>

      {/* Chart */}
      <div className="bg-[#0c0520]/40 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.08)]">
        <h2 className="text-xl font-bold mb-4 text-white">Revenue Growth</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>

              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0c0520', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px' }}
                itemStyle={{ color: '#F3F4F6' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

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
