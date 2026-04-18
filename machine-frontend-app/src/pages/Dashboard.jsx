import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, History, Activity, RefreshCw } from 'lucide-react';
import StockTab from '../components/dashboard/StockTab';
import ProductionTab from '../components/dashboard/ProductionTab';
import TransactionsTab from '../components/dashboard/TransactionsTab';
import MachinesTab from '../components/dashboard/MachinesTab';

const Dashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || 'stock';

  const tabs = [
    { id: 'stock', label: 'Stock', icon: <Package size={18} /> },
    { id: 'transactions', label: 'Transactions', icon: <History size={18} /> },
    { id: 'production', label: 'Production', icon: <Activity size={18} /> },
    { id: 'machines', label: 'Machines Overview', icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '0.2rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>CPI — Tanks (500–2000L) production management</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn btn-ghost" onClick={() => window.location.reload()}>
                <RefreshCw size={18} />
             </button>
             <div style={{ color: 'var(--text-secondary)', fontWeight: '500', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
             </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', gap: '2rem' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => navigate(`/dashboard/${t.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '1rem 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--accent-color)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'stock' && <StockTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'production' && <ProductionTab />}
        {activeTab === 'machines' && <MachinesTab />}
      </div>
    </div>
  );
};

export default Dashboard;
