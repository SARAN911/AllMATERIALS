import React, { useState, useEffect } from 'react';
import { Activity, Plus, Server } from 'lucide-react';
import axios from 'axios';

const ProductionTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/dashboard/production');
      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
                <Plus size={20} /> Add Production
            </button>
        </div>

        <div className="glass-panel">
            <div className="glass-header">
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Recent Production Logs</h3>
            </div>
            <div className="scroll-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Machine</th>
                            <th>Shift</th>
                            <th>Output</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log._id}>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <Server size={16} color="var(--accent-color)" />
                                    <span style={{ fontWeight: '600' }}>{log.machine}</span>
                                </td>
                                <td>
                                    <span className="badge" style={{ background: log.shift === 'Day' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(96, 165, 250, 0.1)', color: log.shift === 'Day' ? '#FBBF24' : '#60A5FA' }}>
                                        {log.shift}
                                    </span>
                                </td>
                                <td style={{ fontWeight: '700' }}>{log.output}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{new Date(log.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && !loading && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No production logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default ProductionTab;
