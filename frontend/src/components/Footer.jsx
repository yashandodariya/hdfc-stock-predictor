import React from 'react';
import { TrendingUp, ShieldAlert } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            HDFC <span className="text-rose-500">Stock Predictor</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-500 max-w-xl text-center md:text-right">
          <ShieldAlert className="h-4 w-4 text-amber-500/70 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> This application uses a machine learning model for educational and predictive simulation purposes. Stock market trading carries high risk. Predictions are not financial advice. Always verify with certified analysts.
          </span>
        </div>

        <p className="text-xs text-slate-500 whitespace-nowrap">
          &copy; {new Date().getFullYear()} HDFC Stock Predictor. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
