import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BusinessProfile from './pages/BusinessProfile';
import AdminDashboard from './pages/AdminDashboard';
import './main.scss';

function App(): React.JSX.Element {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        
        <main className="main-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/business/:id" element={<BusinessProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;