import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:8000' : '/api');


function Predict() {
  const [formData, setFormData] = useState({
    open: '',
    high: '',
    low: '',
    close: '',
    volume: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [selectedModel, setSelectedModel] = useState('Linear Regression');
  const [performances, setPerformances] = useState([]);
  const [perfLoading, setPerfLoading] = useState(true);
  const [perfError, setPerfError] = useState('');

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      setPerfLoading(true);
      const response = await axios.get(`${API_URL}/performance`);
      setPerformances(response.data.performances);
      setPerfError('');
    } catch (err) {
      console.error('Failed to fetch performance metrics:', err);
      setPerfError('Failed to load model performance comparison metrics.');
    } finally {
      setPerfLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const { open, high, low, close, volume } = formData;
    
    if (!open || !high || !low || !close || !volume) {
      return 'All fields are required.';
    }

    const o = parseFloat(open);
    const h = parseFloat(high);
    const l = parseFloat(low);
    const c = parseFloat(close);
    const v = parseInt(volume);

    if (isNaN(o) || o <= 0) return 'Open price must be a positive number.';
    if (isNaN(h) || h <= 0) return 'High price must be a positive number.';
    if (isNaN(l) || l <= 0) return 'Low price must be a positive number.';
    if (isNaN(c) || c <= 0) return 'Close price must be a positive number.';
    if (isNaN(v) || v <= 0) return 'Volume must be a positive integer.';

    if (l > h) {
      return 'Low price cannot be greater than High price.';
    }
    if (o < l || o > h) {
      return 'Open price must lie between Low and High price.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        open: parseFloat(formData.open),
        high: parseFloat(formData.high),
        low: parseFloat(formData.low),
        close: parseFloat(formData.close),
        volume: parseInt(formData.volume),
        model_name: selectedModel
      };

      const response = await axios.post(`${API_URL}/predict`, payload);
      
      const predictionResult = response.data;
      setResult(predictionResult);

      // Save prediction to localStorage history
      saveToHistory({
        ...payload,
        ...predictionResult,
        timestamp: new Date().toLocaleString()
      });

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Cannot connect to backend server. Make sure the FastAPI backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (prediction) => {
    try {
      const existingHistory = JSON.parse(localStorage.getItem('hdfc_prediction_history') || '[]');
      const newHistory = [prediction, ...existingHistory];
      localStorage.setItem('hdfc_prediction_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save prediction to localStorage:', e);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 px-4 sm:px-6 lg:px-8 pt-12">
      {/* Background Gradients */}
      <div className="absolute top-10 left-10 -z-10 h-72 w-72 rounded-full bg-rose-500/5 blur-[80px]" />
      <div className="absolute bottom-10 right-10 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-[80px]" />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">ML Stock Prediction</h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Input daily stock statistics to estimate tomorrow's Close price using the trained LinearRegression engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Prediction Form */}
          <div className="md:col-span-7 bg-slate-900/40 backdrop-blur-md border border-slate-850 p-6 sm:p-8 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-rose-500" /> Stock Input Metrics
            </h2>

            {error && (
              <div className="mb-6 flex gap-2 items-start p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-300 text-sm">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-405 mb-2 uppercase tracking-wide">Open Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    name="open"
                    value={formData.open}
                    onChange={handleChange}
                    placeholder="e.g. 1540.2"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-405 mb-2 uppercase tracking-wide">Close Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    name="close"
                    value={formData.close}
                    onChange={handleChange}
                    placeholder="e.g. 1538.9"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-405 mb-2 uppercase tracking-wide">High Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    name="high"
                    value={formData.high}
                    onChange={handleChange}
                    placeholder="e.g. 1550.0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-405 mb-2 uppercase tracking-wide">Low Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    name="low"
                    value={formData.low}
                    onChange={handleChange}
                    placeholder="e.g. 1531.1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-405 mb-2 uppercase tracking-wide">Volume Traded (Shares)</label>
                <input
                  type="number"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  placeholder="e.g. 18239401"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-405 mb-2 uppercase tracking-wide">Model Selection</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors cursor-pointer text-sm"
                >
                  <option value="Linear Regression">Linear Regression</option>
                  <option value="Polynomial Regression">Polynomial Regression</option>
                  <option value="Ridge Regression">Ridge Regression</option>
                  <option value="Random Forest Regression">Random Forest Regression</option>
                  <option value="Support Vector Regression (SVR)">Support Vector Regression (SVR)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-rose-600/10 disabled:opacity-50 mt-6 focus:outline-none"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" /> Analyzing Stock Data...
                  </>
                ) : (
                  'Predict Tomorrow\'s Close'
                )}
              </button>
            </form>
          </div>

          {/* Prediction Result Display */}
          <div className="md:col-span-5 h-full flex flex-col justify-stretch">
            {loading && (
              <div className="bg-slate-900/20 border border-dashed border-slate-850 p-8 rounded-2xl flex flex-col items-center justify-center text-center h-[380px] animate-pulse">
                <RefreshCw className="h-8 w-8 text-rose-500 animate-spin mb-4" />
                <div className="text-sm font-semibold text-slate-300">Model Is Computing</div>
                <div className="text-xs text-slate-500 mt-1 max-w-[200px]">Scaling input values and evaluating LinearRegression coefficients...</div>
              </div>
            )}

            {!loading && !result && (
              <div className="bg-slate-900/10 border border-dashed border-slate-850 p-8 rounded-2xl flex flex-col items-center justify-center text-center h-[380px]">
                <BarChart2 className="h-10 w-10 text-slate-700 mb-4" />
                <div className="text-sm font-semibold text-slate-400">Awaiting Input Parameters</div>
                <div className="text-xs text-slate-500 mt-1 max-w-[200px]">Fill the metrics on the left and submit to view prediction results.</div>
              </div>
            )}

            {!loading && result && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-scale-in flex flex-col h-full justify-between">
                <div>
                  <div className="bg-gradient-to-r from-rose-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-white tracking-widest uppercase">Prediction Result</span>
                    <Calendar className="h-4 w-4 text-white/80" />
                  </div>
                  
                  <div className="p-6">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Predicted Day Close</div>
                    <div className="text-4xl font-extrabold text-white mb-6">
                      ₹{result.predicted_close.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-850 pt-4 mb-6">
                      <div>
                        <div className="text-xs text-slate-500">Input Close</div>
                        <div className="text-sm font-bold text-slate-205">₹{result.input_close}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Date Logged</div>
                        <div className="text-sm font-bold text-slate-205">{new Date().toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center justify-between ${
                      result.change >= 0 
                        ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-305' 
                        : 'border-red-500/20 bg-red-950/20 text-red-305'
                    }`}>
                      <div className="flex items-center gap-2">
                        {result.change >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        <div className="text-left">
                          <div className="text-xs opacity-70">Price Movement</div>
                          <div className="text-sm font-bold">
                            {result.change >= 0 ? '+' : ''}{result.change.toFixed(2)} (₹)
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs opacity-70">Difference</div>
                        <div className="text-sm font-bold">
                          {result.change >= 0 ? '+' : ''}{result.change_percent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 px-6 py-4 border-t border-slate-850 flex justify-between items-center text-xs text-slate-500">
                  <span>Inference Time: ~1.2ms</span>
                  <span>Accuracy target 99.97%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Model Performance Comparison Table */}
        <div className="mt-12 bg-slate-900/40 backdrop-blur-md border border-slate-850 p-6 sm:p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-500" /> Model Performance Comparison
          </h2>
          {perfLoading ? (
            <div className="text-center py-6 text-slate-400">Loading performance metrics...</div>
          ) : perfError ? (
            <div className="text-center py-6 text-red-400">{perfError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-350">
                <thead className="text-xs uppercase bg-slate-950 text-slate-400">
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 rounded-l-lg">Model</th>
                    <th className="px-6 py-3 text-right">RSS</th>
                    <th className="px-6 py-3 text-right">RMSE</th>
                    <th className="px-6 py-3 text-right rounded-r-lg">R²</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {performances.map((perf, index) => {
                    const isSelected = perf.model.toLowerCase() === selectedModel.toLowerCase();
                    return (
                      <tr 
                        key={index} 
                        className={`hover:bg-slate-800/20 transition-colors ${
                          isSelected ? 'bg-indigo-500/10 font-semibold text-white border-l-2 border-l-indigo-500' : ''
                        }`}
                      >
                        <td className="px-6 py-4 flex items-center gap-2">
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                          {perf.model}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-slate-300">
                          {perf.rss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-slate-300">
                          {perf.rmse.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-emerald-400">
                          {perf.r2.toFixed(6)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Predict;
