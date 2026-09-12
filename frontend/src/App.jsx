import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Analytics from './pages/Analytics';
import AboutMl from './pages/AboutMl';
import History from './pages/History';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-500/30">
        {/* Navigation Navbar */}
        <Navbar />
        
        {/* Main Dashboard Pages */}
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/about-ml" element={<AboutMl />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
        
        {/* footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
