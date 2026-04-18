import React, { useState, useEffect } from 'react';
import { History, ArrowDownLeft, ArrowUpRight, ShieldAlert, Edit2, X, Save, Filter } from 'lucide-react';
import axios from 'axios';

const TransactionsTab = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInventory, setActiveInventory] = useState('CPI Inventory');
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/dashboard/transactions');
      setTransactions(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setEditingRow(t._id);
    setEditData({ ...t });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/dashboard/transactions/${editingRow}`, editData);
      setEditingRow(null);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    if (type === 'IN') return <ArrowDownLeft size={16} color="#10b981" />;
    if (type === 'OUT') return <ArrowUpRight size={16} color="#ef4444" />;
    return <ShieldAlert size={16} color="#FBBF24" />;
  };

  const filteredTransactions = transactions.filter(t => (t.inventoryType || 'CPI Inventory') === activeInventory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Category Toggle */}
        <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--glass-border)' }}>
            {['CPI Inventory', 'New Inventory'].map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveInventory(cat)}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeInventory === cat ? 'var(--accent-color)' : 'transparent',
                        color: activeInventory === cat ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="glass-panel">
            <div className="glass-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <History size={20} color="var(--accent-color)" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{activeInventory} History</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Filter size={14} />
                    <span>Showing all movements</span>
                </div>
            </div>
            <div className="scroll-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Reference</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((t) => {
                            const isEditing = editingRow === t._id;
                            return (
                                <tr key={t._id} style={{ background: isEditing ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                                    <td style={{ fontWeight: '600' }}>{t.material?.name || 'Unknown'}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {getIcon(t.type)}
                                            <span style={{ fontWeight: '600', color: t.type === 'IN' ? '#10b981' : (t.type === 'OUT' ? '#ef4444' : '#FBBF24') }}>
                                                {t.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <input 
                                                type="number" 
                                                value={editData.amount} 
                                                onChange={(e) => setEditData({...editData, amount: Number(e.target.value)})}
                                                style={{ width: '80px', padding: '0.2rem' }}
                                            />
                                        ) : (
                                            <span style={{ fontWeight: '700' }}>{t.amount} kg</span>
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={editData.reference} 
                                                onChange={(e) => setEditData({...editData, reference: e.target.value})}
                                                style={{ padding: '0.2rem' }}
                                            />
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)' }}>{t.reference || '-'}</span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(t.createdAt).toLocaleString()}</td>
                                    <td>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-ghost" onClick={() => setEditingRow(null)} style={{ padding: '0.3rem' }}><X size={14} /></button>
                                                <button className="btn btn-primary" onClick={handleSaveEdit} style={{ padding: '0.3rem' }}><Save size={14} /></button>
                                            </div>
                                        ) : (
                                            <button className="btn btn-ghost" onClick={() => handleEdit(t)} style={{ padding: '0.5rem', opacity: 0.6 }}>
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredTransactions.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <History size={32} style={{ opacity: 0.2 }} />
                                        <span>No transactions recorded in {activeInventory}</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default TransactionsTab;
