import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Eligibility from './pages/Eligibility';
import ApplyNow from './pages/ApplyNow';
import FAQ from './pages/FAQ';
import ProcessingFee from './pages/ProcessingFee';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/eligibility" element={<Eligibility />} />
        <Route path="/apply" element={<ApplyNow />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/processing-fee" element={<ProcessingFee />} />
      </Routes>
    </Router>
  );
}

export default App;