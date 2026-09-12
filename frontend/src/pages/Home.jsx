import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Cpu, ShieldCheck, Database, LineChart } from 'lucide-react';

function Home() {
  const pipelineSteps = [
    {
      title: 'User Input',
      desc: 'Enter Open, High, Low, Close, and Volume values for today\'s HDFC stock activity.',
      icon: <Database className="h-6 w-6 text-indigo-400" />,
    },
    {
      title: 'Preprocessing',
      desc: 'Form inputs are standard-scaled using parameters derived from the outlier-filtered training split (seed 6244).',
      icon: <Cpu className="h-6 w-6 text-amber-400" />,
    },
    {
      title: 'ML Prediction',
      desc: 'Preprocessed inputs are passed to our trained LinearRegression model loaded in the FastAPI backend.',
      icon: <BrainCircuit className="h-6 w-6 text-rose-400" />,
    },
    {
      title: 'Predicted Result',
      desc: 'The model estimates tomorrow\'s closing stock price, calculating expected changes and percentage indicators.',
      icon: <LineChart className="h-6 w-6 text-emerald-400" />,
    },
  ];

  return (
    <div className="relative overflow-hidden bg-slate-950 pb-20">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-rose-600/5 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse select-none">
          <BrainCircuit className="h-4 w-4" /> ML-Powered Forecasting
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-none">
          Predict Tomorrow's <br />
          <span className="bg-gradient-to-r from-rose-500 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
            HDFC Closing Price
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-10 leading-relaxed">
          Leverage a trained scikit-learn machine learning engine to analyze daily HDFC stock metrics and forecast the next day's market closing trend in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/predict"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-500 shadow-xl shadow-rose-600/20 transition-all hover:scale-[1.02]"
          >
            Start Prediction <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          
          <Link
            to="/analytics"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white transition-colors"
          >
            Explore Dashboard
          </Link>
        </div>
      </div>

      {/* Dashboard Stats Preview Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-850 rounded-2xl p-6 hover:border-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Model Accuracy</h3>
            <div className="text-3xl font-extrabold text-white mb-1">99.97%</div>
            <p className="text-xs text-slate-400">R&sup2; performance score evaluated on test split partition</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-850 rounded-2xl p-6 hover:border-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Integrity</h3>
            <div className="text-3xl font-extrabold text-white mb-1">6,184 Records</div>
            <p className="text-xs text-slate-400">Outlier-filtered historical trading sessions processed</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-850 rounded-2xl p-6 hover:border-slate-800 transition-colors">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Model Type</h3>
            <div className="text-3xl font-extrabold text-white mb-1">Linear Regression</div>
            <p className="text-xs text-slate-400">Standard scaled input-to-target coefficient model</p>
          </div>
        </div>
      </div>

      {/* Pipeline Work Flow */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 pt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">ML Prediction Workflow</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            From user input to the final day calculation, see how features propagate through the pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {pipelineSteps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center group">
              {/* Connector lines between cards (Desktop only) */}
              {idx < 3 && (
                <div className="hidden md:block absolute top-10 left-[60%] right-[-40%] h-[2px] bg-gradient-to-r from-rose-500/20 to-indigo-500/20 z-0" />
              )}
              
              <div className="relative z-10 flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform shadow-lg mb-6">
                {step.icon}
              </div>
              
              <div className="text-lg font-bold text-slate-200 mb-2">{step.title}</div>
              <p className="text-xs text-slate-400 px-2 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
