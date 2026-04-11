import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { addMaterialEntry, deleteMaterialEntry, updateMaterialEntry } from '../api/api';
import MaterialModal from './MaterialModal';

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

// Safely converts any DB value to a renderable string — prevents crash when DB has nested objects
const safeRender = (val) => {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const LayerTable = ({ machineId, layerName, initialData, onDataChange, onSaveComplete }) => {
  const [data, setData] = useState(initialData || []);
  const [originalData, setOriginalData] = useState(initialData || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Queue architecture for draft states
  const [addedQueue, setAddedQueue] = useState([]);
  const [updatedQueue, setUpdatedQueue] = useState([]);
  const [deletedQueue, setDeletedQueue] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = addedQueue.length > 0 || updatedQueue.length > 0 || deletedQueue.length > 0;

  // Notify parent whenever local data changes so the Summary can recalculate
  useEffect(() => {
    if (onDataChange) onDataChange(data);
  }, [data]);

  // Protect unsaved local draft states from accidental page reloads
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in the layer table. Are you sure you want to refresh?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleAdd = (formData) => {
    const newItem = { ...formData, _tempId: Math.random().toString() };
    setData(prev => [...prev, newItem]);
    setAddedQueue(prev => [...prev, newItem]);
    setIsModalOpen(false);
  };

  const handleEdit = (formData) => {
    // Instead of { ...item, ...formData } which preserves deleted keys, 
    // we must only keep system properties and apply new formData.
    const cleanItem = (oldItem) => {
      const merged = {};
      Object.keys(oldItem).forEach(k => {
        if (['_id', '_tempId', '_isUpdated', 'shift_time', 'material_name', 'createdAt', 'updatedAt', '__v'].includes(k)) {
          merged[k] = oldItem[k];
        }
      });
      return { ...merged, ...formData };
    };

    setData(prev => prev.map(item => (item._id === editingEntry._id && item._tempId === editingEntry._tempId) ? { ...cleanItem(item), _isUpdated: true } : item));
    
    if (editingEntry._tempId) {
      // Editing an item that was just added locally
      setAddedQueue(prev => prev.map(item => item._tempId === editingEntry._tempId ? cleanItem(item) : item));
    } else {
      // Editing an existing database item
      setUpdatedQueue(prev => {
        const exists = prev.find(i => i._id === editingEntry._id);
        if (exists) return prev.map(i => i._id === editingEntry._id ? cleanItem(i) : i);
        return [...prev, cleanItem({ _id: editingEntry._id })];
      });
    }
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleDelete = (entry) => {
    if (!window.confirm('Remove this material entry? (Requires Saving Changes to commit)')) return;
    
    setData(prev => prev.filter(item => item._id !== entry._id && item._tempId !== entry._tempId));
    
    if (entry._tempId) {
      setAddedQueue(prev => prev.filter(item => item._tempId !== entry._tempId));
    } else {
      setDeletedQueue(prev => [...prev, entry._id]);
      setUpdatedQueue(prev => prev.filter(item => item._id !== entry._id));
    }
  };

  const handleSaveLayer = async () => {
    setIsSaving(true);
    try {
      for (const id of deletedQueue) {
        await deleteMaterialEntry(machineId, layerName, id);
      }
      for (const item of addedQueue) {
        const cleanItem = { ...item };
        delete cleanItem._tempId;
        await addMaterialEntry(machineId, layerName, cleanItem);
      }
      for (const item of updatedQueue) {
        const id = item._id;
        const cleanItem = { ...item };
        delete cleanItem._id;
        delete cleanItem._isUpdated;
        await updateMaterialEntry(machineId, layerName, id, cleanItem);
      }
      
      setOriginalData(data);
      setAddedQueue([]);
      setUpdatedQueue([]);
      setDeletedQueue([]);
      alert(`✅ ${layerName} layer saved securely!`);
      // Sync strictly with backend to grab exact MongoDB _ids for new items
      if (onSaveComplete) onSaveComplete();
    } catch (err) {
      console.error(err);
      alert('Error saving modifications: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelLayer = () => {
    setData(originalData);
    setAddedQueue([]);
    setUpdatedQueue([]);
    setDeletedQueue([]);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  // Dynamically calculate columns based on whatever properties exist in the data
  const dynamicColumnsSet = new Set();
  
  // Consistently enforce predefined columns for the current layer
  const layer = layerName?.toLowerCase();
  if (layer === 'inner') INNER_FIELDS.forEach(f => dynamicColumnsSet.add(f));
  if (layer === 'middle') MIDDLE_FIELDS.forEach(f => dynamicColumnsSet.add(f));
  if (layer === 'outer') OUTER_FIELDS.forEach(f => dynamicColumnsSet.add(f));

  const legacyFields = ['INNFO_RMFO', 'Mic_VC', 'HEAVY_TANK', 'HEAVY_LO', 'T_MY_HD', 'T_MY_WT', 'Hoven_Threme', 'B_RU_MAX', 'IJ_RU_BK', 'FOAL_BK', 'Mud_BK', 'FIP_BULL_BK', 'BULL_BK', 'BK_200', 'KOR_BK', 'BLACK', 'M_BLU_V', 'BK_DARD', 'BUL_V', 'Mod_BK', 'BK_VALUE', 'LD_BK', 'Wt_plus', 'FOAF_VH', 'Fibad', 'Mes_LD_HD', 'LD_HD_200', 'BKod_BK', 'DDD_MIN', 'POLY'];

  data.forEach(item => {
    Object.keys(item).forEach(key => {
      const isObject = typeof item[key] === 'object' && item[key] !== null;
      if (!['_id', '_tempId', '_isUpdated', 'shift_time', 'material_name', 'createdAt', 'updatedAt', '__v'].includes(key) && !legacyFields.includes(key) && !isObject) {
        dynamicColumnsSet.add(key);
      }
    });
  });
  
  // Create an array of columns: first is always 'shift_time', then any dynamic keys found
  const previewColumns = ['shift_time', ...Array.from(dynamicColumnsSet)];

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div className="glass-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '500', textTransform: 'capitalize' }}>{layerName} Layer</h2>
          <span className="badge">{data.length} Materials</span>
          {isDirty && <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontStyle: 'italic' }}>Unsaved Changes •</span>}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isDirty && (
            <>
              <button className="btn btn-ghost" onClick={handleCancelLayer} disabled={isSaving}>
                <X size={16} /> Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveLayer} disabled={isSaving} style={{ background: 'var(--success-color)' }}>
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Add Material
          </button>
        </div>
      </div>

      <div className="scroll-table-container">
        {data.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No materials configured for {layerName} layer.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {previewColumns.map(col => <th key={col}>{col.replace(/_/g, ' ')}</th>)}
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item._id || item._tempId || idx} style={{ background: item._tempId ? 'rgba(16, 185, 129, 0.1)' : item._isUpdated ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                  <td style={{ fontWeight: '600', color: 'white' }}>
                    {item.shift_time || 'Day'}
                    {item._tempId && <span style={{ fontSize: '0.6rem', color: 'var(--success-color)', marginLeft: '0.5rem', verticalAlign: 'super' }}>NEW</span>}
                    {item._isUpdated && <span style={{ fontSize: '0.6rem', color: 'var(--accent-color)', marginLeft: '0.5rem', verticalAlign: 'super' }}>EDITED</span>}
                  </td>
                  {previewColumns.slice(1).map(col => (
                    <td key={col}>{safeRender(item[col])}</td>
                  ))}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => openEditModal(item)} title="Edit Entry">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger-color)' }} onClick={() => handleDelete(item)} title="Delete Entry">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <MaterialModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingEntry(null); }} 
          onSubmit={editingEntry ? handleEdit : handleAdd}
          initialData={editingEntry}
          layerName={layerName}
        />
      )}
    </div>
  );
};

export default LayerTable;
