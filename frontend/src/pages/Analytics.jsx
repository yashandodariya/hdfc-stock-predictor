import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Info, RefreshCw, Activity, ShieldAlert } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:8000' : '/api');


function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(300);

  useEffect(() => {
    fetchAnalytics();
  }, [limit]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/analytics?limit=${limit}`);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load historical analytics. Ensure the FastAPI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 px-4 sm:px-6 lg:px-8 pt-12">
      {/* Background radial gradient */}
      <div className="absolute top-0 right-10 -z-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-[80px]" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">HDFC Market Analytics</h1>
            <p className="text-slate-400">
              Interactive visualizations and KPIs computed from the historical HDFC stock dataset.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-stretch md:self-auto justify-between">
            <span className="text-xs text-slate-500 font-semibold px-2 uppercase tracking-wider">Range limit</span>
            <div className="flex gap-1">
              {[100, 300, 1000].map((val) => (
                <button
                  key={val}
                  onClick={() => setLimit(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    limit === val
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  {val} days
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 flex gap-2 items-center p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-300 text-sm max-w-xl mx-auto">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
            <span>{error}</span>
            <button onClick={fetchAnalytics} className="ml-auto flex items-center gap-1 text-xs text-rose-400 underline font-semibold focus:outline-none">
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl h-28 animate-pulse flex flex-col justify-between">
                <div className="h-4 bg-slate-800 rounded w-24"></div>
                <div className="h-8 bg-slate-800 rounded w-36"></div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics KPIs Summary Row */}
        {!loading && data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-fade-in">
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-850 p-6 rounded-2xl shadow-lg hover:border-slate-800 transition-colors">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-rose-500" /> Latest Close
              </div>
              <div className="text-2xl font-extrabold text-white">₹{data.latest_close.toLocaleString('en-IN')}</div>
              <p className="text-[10px] text-slate-500 mt-1">Most recent day close value in record set</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-850 p-6 rounded-2xl shadow-lg hover:border-slate-800 transition-colors">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-500" /> Highest Price
              </div>
              <div className="text-2xl font-extrabold text-white">₹{data.highest_close.toLocaleString('en-IN')}</div>
              <p className="text-[10px] text-slate-500 mt-1">Peak close price across entire dataset</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-850 p-6 rounded-2xl shadow-lg hover:border-slate-800 transition-colors">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-zinc-500 rotation-180 rotate-180" /> Lowest Price
              </div>
              <div className="text-2xl font-extrabold text-white">₹{data.lowest_close.toLocaleString('en-IN')}</div>
              <p className="text-[10px] text-slate-500 mt-1">Historical base close value in record set</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-850 p-6 rounded-2xl shadow-lg hover:border-slate-800 transition-colors">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-emerald-500" /> Average Volume
              </div>
              <div className="text-2xl font-extrabold text-white">{(data.average_volume / 1000000).toFixed(2)}M</div>
              <p className="text-[10px] text-slate-500 mt-1">Mean shared volume traded per session</p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {loading && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-850 h-[360px] rounded-2xl animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-slate-850 h-[280px] rounded-2xl animate-pulse"></div>
              <div className="bg-slate-900/40 border border-slate-850 h-[280px] rounded-2xl animate-pulse"></div>
            </div>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-8 animate-fade-in">
            {/* Historical Closing Price Area Chart */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl shadow-lg">
              <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-500" /> Historical Price Trend (Close)
              </h2>
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.historical_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} type="number" domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#f8fafc', fontSize: '13px' }}
                      formatter={(value) => [`₹${value.toFixed(2)}`, 'Close Price']}
                    />
                    <Area type="monotone" dataKey="close" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorClose)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Open vs Close & Volume Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Open vs Close Line Chart */}
              <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl shadow-lg">
                <h2 className="text-base font-bold text-slate-200 mb-6 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-500" /> Open vs Close Price
                </h2>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.historical_data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                      <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Open" />
                      <Line type="monotone" dataKey="close" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Close" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Volume Traded Bar Chart */}
              <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl shadow-lg">
                <h2 className="text-base font-bold text-slate-200 mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-500" /> Daily Share Volumes
                </h2>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.historical_data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={9}
                        tickLine={false}
                        formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                        itemStyle={{ color: '#10b981', fontSize: '12px' }}
                        formatter={(value) => [value.toLocaleString(), 'VolumeTraded']}
                      />
                      <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} name="Shares" opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
