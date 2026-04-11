import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Server, Activity, Settings, Database, ServerCrash } from 'lucide-react';
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
        // Auto-seed if empty
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

  const getIcon = (id) => {
    return <Server size={20} />;
  };

  return (
    <div className="sidebar">
      <div style={{ padding: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ background: 'var(--accent-color)', padding: '0.5rem', borderRadius: '10px' }}>
          <Activity size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>CamGuard API</h2>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1rem 0 0.5rem 0.5rem' }}>Machines Overview</p>
      
      <div className="sidebar-nav">
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>Loading...</p>
        ) : (
          machines.map((m) => (
            <NavLink 
              key={m._id} 
              to={`/machine/${m.machine_id}`} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {getIcon(m.machine_id)}
              <span>Machine {m.machine_id}</span>
            </NavLink>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
