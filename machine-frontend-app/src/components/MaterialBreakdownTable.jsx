import React, { useMemo } from 'react';
import { PackageSearch } from 'lucide-react';

const MaterialBreakdownTable = ({ innerData = [], middleData = [], outerData = [] }) => {
  const materials = useMemo(() => {
    const totals = {};
    const allData = [...innerData, ...middleData, ...outerData];
    
    const ignoreKeys = ['_id', '_tempId', '_isUpdated', 'shift_time', 'material_name', 'createdAt', 'updatedAt', '__v'];
    
    allData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (!ignoreKeys.includes(key)) {
          const val = parseFloat(item[key]);
          if (!isNaN(val)) {
            if (!totals[key]) {
              totals[key] = 0;
            }
            totals[key] += val;
          }
        }
      });
    });

    // Convert to array
    const result = Object.entries(totals).map(([name, total]) => ({ name, total }));
    // Filter out 0s if any exist somehow
    return result.filter(r => r.total !== 0);
  }, [innerData, middleData, outerData]);

  const grandTotal = materials.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', marginTop: '0.5rem' }}>
      <div
        className="glass-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(20,184,166,0.1) 100%)',
          borderBottom: '1px solid rgba(16,185,129,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #10b981, #14b8a6)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
            }}
          >
            <PackageSearch size={18} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'white', marginBottom: '2px' }}>
              Material Consumption Breakdown
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Specific material usage summed across all layers
            </p>
          </div>
        </div>
        
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '0.35rem 0.75rem',
          }}
        >
          <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Grand Total
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#6ee7b7' }}>
            {parseFloat(grandTotal.toFixed(2))}
          </span>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {materials.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem 0' }}>
            No material data available.
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '1rem' 
          }}>
            {materials.map(({ name, total }) => (
              <div 
                key={name}
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.8rem 1.2rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white' }}>{name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Material</span>
                </div>
                <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#a5b4fc', fontFamily: 'monospace' }}>
                  {parseFloat(total.toFixed(4))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialBreakdownTable;
