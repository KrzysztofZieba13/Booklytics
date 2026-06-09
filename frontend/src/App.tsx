import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BusinessProfile from './pages/BusinessProfile';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MyBookings from './pages/MyBookings';
import Summary from './pages/Summary';
import Login from './pages/Login';
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
            <Route path="/summary/:bookingId" element={<Summary />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;