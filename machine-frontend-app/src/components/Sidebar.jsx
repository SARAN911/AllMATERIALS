import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Server, Activity, LayoutDashboard, Package, History, Kanban } from 'lucide-react';
import { getMachines, seedMachines } from '../api/api';

const Sidebar = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await getMachines();
      if (res.data.data.length === 0) {
        await seedMachines();
        const refetched = await getMachines();
        setMachines(refetched.data.data);
      } else {
        setMachines(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="sidebar">
      <div style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ background: 'var(--accent-color)', padding: '0.5rem', borderRadius: '10px' }}>
          <Activity size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em' }}>CamGuard API</h2>
      </div>
      
      <div className="sidebar-nav">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem 0.5rem', fontWeight: '700' }}>Main Menu</p>
        
        <NavLink to="/dashboard/stock" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '1.5rem 0 0.5rem 0.5rem', fontWeight: '700' }}>Machines</p>
        
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', padding: '1rem', fontSize: '0.8rem' }}>Loading...</p>
        ) : (
          machines.map((m) => (
            <NavLink 
              key={m._id} 
              to={`/machine/${m.machine_id}`} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Server size={18} />
              <span>Machine {m.machine_id}</span>
            </NavLink>
          ))
        )}
      </div>

      <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>System Status: OK</span>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
