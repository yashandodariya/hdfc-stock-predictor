import React, { useState, useEffect } from 'react';
import { Trash2, Search, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';

function History() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, up, down

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('hdfc_prediction_history') || '[]');
      setHistory(savedHistory);
    } catch (e) {
      console.error('Failed to load history from localStorage:', e);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all prediction history entries?')) {
      localStorage.removeItem('hdfc_prediction_history');
      setHistory([]);
    }
  };

  const deleteItem = (indexToDelete) => {
    const newHistory = history.filter((_, idx) => idx !== indexToDelete);
    localStorage.setItem('hdfc_prediction_history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.timestamp.toLowerCase().includes(search.toLowerCase()) ||
      item.close.toString().includes(search) ||
      item.predicted_close.toString().includes(search);

    const isPriceUp = item.change >= 0;
    if (filterType === 'up') return matchesSearch && isPriceUp;
    if (filterType === 'down') return matchesSearch && !isPriceUp;
    
    return matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 px-4 sm:px-6 lg:px-8 pt-12">
      {/* Background elements */}
      <div className="absolute top-1/4 left-10 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-[80px]" />

      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Prediction Logs</h1>
            <p className="text-slate-400">Review, filter, and audit all stock forecasting runs saved in your local browser storage.</p>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-500/20 bg-red-950/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-950/40 hover:border-red-500/40 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="h-4 w-4" /> Clear All History
            </button>
          )}
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search history by date, price..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            {['all', 'up', 'down'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filterType === type
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-450 hover:text-white hover:bg-slate-850'
                }`}
              >
                {type} movements
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        {filteredHistory.length === 0 ? (
          <div className="bg-slate-900/10 border border-dashed border-slate-850 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <Layers className="h-10 w-10 text-slate-700 mb-4" />
            <span className="text-slate-400 font-bold mb-1">No Entries Found</span>
            <span className="text-xs text-slate-550 max-w-[280px]">
              {history.length === 0 
                ? 'Your prediction logs folder is empty. Go to the Predict tab to make stock forecasts.' 
                : 'No logs matching the selected search query or filtering state.'}
            </span>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-850">
                    <th className="px-6 py-4">Session Date/Time</th>
                    <th className="px-4 py-4 text-right">Open</th>
                    <th className="px-4 py-4 text-right">High</th>
                    <th className="px-4 py-4 text-right">Low</th>
                    <th className="px-4 py-4 text-right">Close</th>
                    <th className="px-4 py-4 text-right">Volume</th>
                    <th className="px-4 py-4 text-right">Forecast Close</th>
                    <th className="px-4 py-4 text-right">Expected Change</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 text-sm">
                  {filteredHistory.map((item, idx) => {
                    const isUp = item.change >= 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 text-xs font-semibold text-slate-400 whitespace-nowrap">{item.timestamp}</td>
                        <td className="px-4 py-4 text-right font-mono text-xs text-slate-300">₹{item.open.toFixed(2)}</td>
                        <td className="px-4 py-4 text-right font-mono text-xs text-slate-350">₹{item.high.toFixed(2)}</td>
                        <td className="px-4 py-4 text-right font-mono text-xs text-slate-350">₹{item.low.toFixed(2)}</td>
                        <td className="px-4 py-4 text-right font-mono text-xs text-slate-200">₹{item.close.toFixed(2)}</td>
                        <td className="px-4 py-4 text-right font-mono text-xs text-slate-400">{(item.volume / 1000000).toFixed(2)}M</td>
                        <td className="px-4 py-4 text-right font-mono text-xs font-bold text-white">₹{item.predicted_close.toFixed(2)}</td>
                        <td className={`px-4 py-4 text-right font-mono text-xs font-bold whitespace-nowrap ${isUp ? 'text-emerald-400' : 'text-red-405'}`}>
                          <span className="flex items-center justify-end gap-1">
                            {isUp ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /> : <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />}
                            {isUp ? '+' : ''}{item.change.toFixed(2)} ({item.change_percent.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => deleteItem(idx)}
                            className="bg-slate-950 hover:bg-red-950/20 p-2 text-slate-500 hover:text-red-400 rounded-lg border border-slate-850 hover:border-red-500/20 transition-all focus:outline-none"
                            title="Delete log"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
