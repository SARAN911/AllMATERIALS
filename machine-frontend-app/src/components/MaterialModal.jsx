import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Plus, Trash2 } from 'lucide-react';

const INNER_FIELDS = [
  'OO3', 'PS 148', 'EQUATE', 'PS LD', '002', 'INDO', 'GREY HD', 'WH LD', 
  'Milk LD', 'HEAVY DUTY', 'VC TANK', 'EVA', 'HD 001', 'C․LD', 'D․BR․W H', 
  'WH M/B', 'T․M/B', 'POLY MAX'
];

const MIDDLE_FIELDS = [
  'RP BK', 'CLR HM', 'CLR HARD', 'F․T HD', 'BK LD', 'COLOUR LD', 
  '200 BK HD', 'BK HM', 'Bk M/B', 'M․POLY MAX'
];

const OUTER_FIELDS = [
  'OO3', 'EQUATE', 'PS 148', 'PS LD', '002', 'TITANIUM M/B', 'WH LD', 
  'HEAVY DUTY', 'BOTTLE LD', 'WH HM', 'NATURAL HD', 'MILK LD', 'EVA', 
  'CONTAINER WH LD', 'VALAI HD', 'YL LD', 'UV WH 001 M/B', 'WH M/B', 
  'C․WH M/B', 'POLYMAX'
];

const DEFAULT_FIELDS = [];

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '2rem',
};

const modalStyle = {
  width: '100%',
  maxWidth: '900px',
  height: '85vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(30, 41, 59, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  overflow: 'hidden',
};

// Blocks Enter (accidental submit/navigate) and prevents browser-back shortcuts
const blockEnterKey = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
  }
  if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'Backspace')) {
    e.preventDefault();
    e.stopPropagation();
  }
};

const MaterialModal = ({ isOpen, onClose, onSubmit, initialData, layerName }) => {
  const [fields, setFields] = useState([]);
  const [shiftTime, setShiftTime] = useState(initialData?.shift_time || 'Day');

  useEffect(() => {
    if (initialData) {
      const dynamicFields = [];
      const legacyFields = ['INNFO_RMFO', 'Mic_VC', 'HEAVY_TANK', 'HEAVY_LO', 'T_MY_HD', 'T_MY_WT', 'Hoven_Threme', 'B_RU_MAX', 'IJ_RU_BK', 'FOAL_BK', 'Mud_BK', 'FIP_BULL_BK', 'BULL_BK', 'BK_200', 'KOR_BK', 'BLACK', 'M_BLU_V', 'BK_DARD', 'BUL_V', 'Mod_BK', 'BK_VALUE', 'LD_BK', 'Wt_plus', 'FOAF_VH', 'Fibad', 'Mes_LD_HD', 'LD_HD_200', 'BKod_BK', 'DDD_MIN', 'POLY'];

      Object.keys(initialData).forEach(key => {
        const isObject = typeof initialData[key] === 'object' && initialData[key] !== null;
        if (!['_id', '_tempId', '_isUpdated', 'shift_time', 'material_name', 'createdAt', 'updatedAt', '__v'].includes(key) && !legacyFields.includes(key) && !isObject) {
          dynamicFields.push({ id: Math.random().toString(), key, value: initialData[key] });
        }
      });
      setFields(dynamicFields);
    } else {
      const layer = layerName?.toLowerCase();
      const defaultList = layer === 'inner' ? INNER_FIELDS : 
                          layer === 'middle' ? MIDDLE_FIELDS : 
                          layer === 'outer' ? OUTER_FIELDS : DEFAULT_FIELDS;
      setFields(defaultList.map(f => ({ id: Math.random().toString(), key: f, value: 0 })));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleFieldChange = (id, fieldName, newValue) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [fieldName]: newValue } : f));
  };

  const removeField = (id) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const addField = () => {
    setFields(prev => [{ id: Math.random().toString(), key: '', value: 0 }, ...prev]);
  };

  // Save is called ONLY via the Save button click — no form, no Enter-to-submit
  const handleSave = () => {
    const finalData = { shift_time: shiftTime };
    const keySet = new Set();
    for (const f of fields) {
      // Replace raw periods with U+2024 One Dot Leader to prevent Mongoose nested object bugs
      const k = f.key.trim().replace(/\./g, '․');
      if (!k) continue;
      if (keySet.has(k)) { alert(`Duplicate metric name: ${k}`); return; }
      keySet.add(k);
      finalData[k] = Number(f.value) || 0;
    }
    onSubmit(finalData);
  };

  const modal = (
    <div
      style={overlayStyle}
      // Only close when clicking the dark backdrop itself, not anything inside
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={modalStyle}
        // Stop all mouse + keyboard events from reaching the backdrop
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); }
          if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'Backspace')) {
            e.preventDefault(); e.stopPropagation();
          }
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#f8fafc' }}>
            {initialData ? 'Edit' : 'Add'} Material Entry ({layerName})
          </h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable body — plain div, NO <form> ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Shift Time Selection */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.75rem' }}>Shift Time</h3>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#f8fafc' }}>
                <input 
                  type="radio" 
                  name="shiftTime" 
                  value="Day" 
                  checked={shiftTime === 'Day'} 
                  onChange={(e) => setShiftTime(e.target.value)} 
                  style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                />
                Day
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#f8fafc' }}>
                <input 
                  type="radio" 
                  name="shiftTime" 
                  value="Night" 
                  checked={shiftTime === 'Night'} 
                  onChange={(e) => setShiftTime(e.target.value)} 
                  style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                />
                Night
              </label>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: '600' }}>Metrics &amp; Configuration Values</h3>
              <button type="button" className="btn btn-ghost" onClick={addField} style={{ color: '#3b82f6', fontSize: '0.85rem' }}>
                <Plus size={15} /> Add Metric
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {fields.map((field) => (
                <div
                  key={field.id}
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => handleFieldChange(field.id, 'key', e.target.value)}
                      onKeyDown={blockEnterKey}
                      placeholder="Metric Name"
                      style={{ fontSize: '0.82rem', padding: '0.35rem 0.5rem' }}
                    />
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id, 'value', e.target.value)}
                      onKeyDown={blockEnterKey}
                      placeholder="Value"
                      style={{ fontSize: '0.88rem', padding: '0.35rem 0.5rem' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => removeField(field.id)}
                    style={{ padding: '0.4rem', color: '#ef4444', flexShrink: 0 }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {fields.length === 0 && (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  No metrics defined. Click "+ Add Metric" to add one.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, background: 'rgba(15,23,42,0.6)' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            <X size={16} /> Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            <Save size={16} /> Confirm Details
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default MaterialModal;
