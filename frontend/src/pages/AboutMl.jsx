import React from 'react';
import { Cpu, Scale, BrainCircuit, Activity, CheckCircle2, Shuffle } from 'lucide-react';

function AboutMl() {
  const modelStats = [
    { label: 'Algorithm', value: 'Linear Regression', desc: 'Fits a linear relation between input indicators and the target.' },
    { label: 'R² Accuracy Score', value: '99.97%', desc: 'R-squared performance evaluating predictive variance fit.' },
    { label: 'Mean Squared Error', value: '25.43', desc: 'Average squared deviation of predicted values from true prices.' },
    { label: 'Dataset Size', value: '6,184 rows', desc: 'Refined stock market daily logs after volume outlier filtering.' },
  ];

  const features = [
    { name: 'Close', importance: 'High (coef: 286.91)', desc: 'Prevailing stock closing price. Heavily influences tomorrow\'s predicted Close.' },
    { name: 'High', importance: 'Medium (coef: 22.29)', desc: 'The maximum session trading price during the market day.' },
    { name: 'Low', importance: 'Medium (coef: 14.84)', desc: 'The lowest price target recorded during the day\'s session.' },
    { name: 'Open', importance: 'Negative (coef: -34.44)', desc: 'Open boundary trading price used for checking intra-day spreads.' },
    { name: 'Volume', importance: 'Minimal (coef: -0.025)', desc: 'Total volume of shares exchanged, scaled to fit coefficients.' },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 px-4 sm:px-6 lg:px-8 pt-12">
      {/* Background radial gradient */}
      <div className="absolute bottom-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-rose-500/5 blur-[80px]" />

      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-extrabold text-white mb-3">Model & Machine Learning Mechanics</h1>
          <p className="text-slate-405 max-w-xl mx-auto">
            Deep dive into the scikit-learn Linear Regression model training, parameters, and preprocessing steps.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-rose-500" /> Linear Regression Engine
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              The application utilizes a fitted <strong>Linear Regression</strong> model. Linear Regression is a supervised learning methodology that maps the dependent target variable (Tomorrow's Close price) as a weighted linear combination of independant features (Close, High, Low, Open, Volume).
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Because stock prices on consecutive days are highly correlated, this linear model identifies strong coefficients. Validation tests achieve a correlation score above 99.9%.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-500" /> StandardScaler Preprocessing
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Stock values and volume represent different numerical scales (prices hover around ₹500 - ₹3,000, while volumes exceed tens of millions). Feeding raw volumes into the model could destabilize weights.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              To normalize weights, a <strong>StandardScaler</strong> is fit on the 80% train split. Before inference is sent to the classifier, user inputs are standardized:
              <span className="block font-mono bg-slate-950 p-2 rounded-lg border border-slate-850 text-xs text-rose-400 mt-2">
                x_scaled = (x - mean) / std
              </span>
            </p>
          </div>
        </div>

        {/* Model Metrics */}
        <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-6 mb-12">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" /> Model Performance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {modelStats.map((stat, idx) => (
              <div key={idx} className="border-r last:border-0 border-slate-850 pr-4">
                <div className="text-2xl font-extrabold text-white mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-slate-500 mb-1">{stat.label}</div>
                <p className="text-[10px] text-slate-400 leading-tight">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Model Coefficients Detail */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 mb-12">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-amber-500" /> Feature Coefficient Weightings
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Features represent the scaled inputs. The loaded model has an intercept of <code className="bg-slate-950 px-1.5 py-0.5 rounded text-white border border-slate-850">265.98</code>.
          </p>
          <div className="space-y-4">
            {features.map((feat, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b last:border-0 border-slate-850/50 pb-4 last:pb-0">
                <div className="mb-2 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500" />
                    <span className="text-sm font-bold text-slate-200">{feat.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg">{feat.desc}</p>
                </div>
                <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-400 font-semibold shrink-0 self-start sm:self-auto">
                  {feat.importance}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Equation */}
        <div className="border border-indigo-500/20 bg-indigo-950/10 p-6 rounded-2xl text-center">
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3">Model Formula</h3>
          <div className="font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap max-w-full">
            Y_pred = Close &times; 286.91 + High &times; 22.29 + Low &times; 14.84 - Open &times; 34.44 - Volume &times; 0.025 + 265.98
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Note: Input variables must first be adjusted by the StandardScaler mean/std before applying this formula.</p>
        </div>
      </div>
    </div>
  );
}

export default AboutMl;
