import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MachineControlPanel from './pages/MachineControlPanel';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/stock" replace />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/stock" replace />} />
            <Route path="/dashboard/:tab" element={<Dashboard />} />
            <Route path="/machine/:id" element={<MachineControlPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
