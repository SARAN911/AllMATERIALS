import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Activity, ChevronRight, Settings } from 'lucide-react';
import axios from 'axios';

const MachinesTab = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await axios.get('/api/machines');
      setMachines(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {machines.map((m) => (
        <div
          key={m._id}
          className="glass-panel animate-fade-in"
          style={{
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          onClick={() => navigate(`/machine/${m.machine_id}`)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = 'var(--accent-color)';
            e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.6rem', borderRadius: '10px', color: 'var(--accent-color)' }}>
                <Server size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Machine {m.machine_id}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
                   <Activity size={12} />
                   <span>ONLINE</span>
                </div>
              </div>
            </div>
            <ChevronRight size={20} color="var(--text-secondary)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
             <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.8rem', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Production</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700' }}>{m.consentData?.length || 0} Layers</p>
             </div>
             <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.8rem', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Efficiency</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>98.2%</p>
             </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
             <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                <Settings size={14} /> Configure
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MachinesTab;
