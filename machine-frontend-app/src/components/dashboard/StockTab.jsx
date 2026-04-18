import React, { useState, useEffect } from 'react';
import { Package, ArrowDown, ArrowUp, Layers, Droplets, Plus, Edit2, X, Save, Search } from 'lucide-react';
import axios from 'axios';

const StockTab = () => {
  const [stocks, setStocks] = useState([]);
  const [stats, setStats] = useState({ totalProduction: 0, totalDespatch: 50, materials: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', unit: 'kg', stock: 0, minStock: 100 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stockRes, statsRes] = await Promise.all([
        axios.get('/api/dashboard/stock'),
        axios.get('/api/dashboard/production/stats')
      ]);
      setStocks(stockRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, unit: item.unit, stock: item.stock, minStock: item.minStock });
    } else {
      setEditingItem(null);
      setFormData({ name: '', unit: 'kg', stock: 0, minStock: 100 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`/api/dashboard/stock/${editingItem._id}`, formData);
      } else {
        await axios.post('/api/dashboard/stock', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Low stock') return '#FBBF24';
    if (status === 'Out of stock') return '#ef4444';
    return '#10b981';
  };

  const filteredStocks = stocks.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const fmtValue = (val) => {
      if (val >= 1000) return (val/1000).toFixed(1) + 't';
      return val.toFixed(1) + 'kg';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.8rem', borderRadius: '12px', color: '#10b981' }}>
            <ArrowDown size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
               <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{fmtValue(stats.totalProduction)}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Production</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>Σ Production (all machines)</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '0.8rem', borderRadius: '12px', color: '#f87171' }}>
            <ArrowUp size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
               <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f87171' }}>{stats.totalDespatch}kg</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Despatch</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.8rem', borderRadius: '12px', color: '#818cf8' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
               <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.materials}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Materials</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '3rem', width: '100%' }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ borderRadius: '12px', height: '45px' }}>
          <Plus size={20} /> Add New Stock
        </button>
      </div>

      {/* Stock List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filteredStocks.map((item) => (
          <div key={item._id} className="glass-panel" style={{ padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.8rem', borderRadius: '12px', color: 'var(--accent-color)' }}>
                <Droplets size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.2rem' }}>{item.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: getStatusColor(item.status), fontWeight: '700', textTransform: 'uppercase' }}>{item.status}</span>
                    <button className="btn btn-ghost" onClick={() => handleOpenModal(item)} style={{ padding: '2px', color: 'var(--text-secondary)' }}>
                        <Edit2 size={12} />
                    </button>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '700' }}>{item.stock.toFixed(1)}</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.unit}</p>
            </div>
          </div>
        ))}
        {filteredStocks.length === 0 && !loading && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No materials matching "{searchTerm}"</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ height: 'auto', maxHeight: '90vh' }}>
            <div className="glass-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{editingItem ? 'Edit Material' : 'Add New Material'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>MATERIAL NAME</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. White LD Agloo"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>CURRENT STOCK</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>UNIT</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="kg">kilograms (kg)</option>
                    <option value="ton">tons (t)</option>
                    <option value="pcs">pieces (pcs)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>REORDER THRESHOLD (MIN STOCK)</label>
                <input
                  required
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  <Save size={18} /> {editingItem ? 'Update Material' : 'Create Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTab;
