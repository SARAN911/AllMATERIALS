import React, { useEffect, useState, Component } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Edit2, X, RefreshCw, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';
import { getMachine, addConsentRow, updateConsentRow, deleteConsentRow } from '../api/api';
import LayerTable from '../components/LayerTable';
import OverallSummaryTable from '../components/OverallSummaryTable';
import MaterialBreakdownTable from '../components/MaterialBreakdownTable';

// Error boundary — prevents one bad layer from crashing the whole page
class LayerErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Layer render error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ color: '#ef4444', fontWeight: '600', margin: '0 0 0.25rem' }}>Layer data contains invalid format</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>{String(this.state.error?.message || 'Unknown error')} — please fix the data in the database for this layer.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── blank new-row template ─────────────────────────────────────────────────────
const BLANK_ROW = { LTR: '', MODEL: '', COLOUR: '', WEIGHT: '', PRODUCTION: '', shift_time: 'Day' };

const Dashboard = () => {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live layer data
  const [liveInner, setLiveInner] = useState([]);
  const [liveMiddle, setLiveMiddle] = useState([]);
  const [liveOuter, setLiveOuter] = useState([]);

  // Array of consent rows
  const [consentRows, setConsentRows] = useState([]);
  // Which row _id is currently being edited inline (null = none)
  const [editingRowId, setEditingRowId] = useState(null);
  // The draft values for the row being edited
  const [editDraft, setEditDraft] = useState({});
  // "Add LTR" form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRow, setNewRow] = useState({ ...BLANK_ROW });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMachineData(); }, [id]);

  const fetchMachineData = async () => {
    setLoading(true);
    try {
      const res = await getMachine(id);
      const m = res.data.data;
      setMachine(m);
      // Support both old single-object format & new array format
      const cd = m.consentData;
      setConsentRows(Array.isArray(cd) ? cd : (cd && cd.LTR !== undefined ? [{ ...cd, _id: 'legacy' }] : []));
      setLiveInner(m.inner || []);
      setLiveMiddle(m.middle || []);
      setLiveOuter(m.outer || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Add new row ──────────────────────────────────────────────────────────────
  const handleAddRow = async () => {
    setSaving(true);
    try {
      await addConsentRow(id, {
        LTR: newRow.LTR,
        MODEL: newRow.MODEL,
        COLOUR: newRow.COLOUR,
        WEIGHT: Number(newRow.WEIGHT) || 0,
        PRODUCTION: Number(newRow.PRODUCTION) || 0,
        shift_time: newRow.shift_time || 'Day',
      });
      setNewRow({ ...BLANK_ROW });
      setShowAddForm(false);
      fetchMachineData();
    } catch (err) {
      console.error('Error adding consent row', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Inline edit ──────────────────────────────────────────────────────────────
  const startEdit = (row) => {
    setEditingRowId(row._id);
    setEditDraft({ LTR: row.LTR, MODEL: row.MODEL, COLOUR: row.COLOUR, WEIGHT: row.WEIGHT, PRODUCTION: row.PRODUCTION, shift_time: row.shift_time || 'Day' });
  };

  const handleEditDraft = (e) => {
    const { name, value } = e.target;
    setEditDraft(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (rowId) => {
    setSaving(true);
    try {
      await updateConsentRow(id, rowId, {
        LTR: editDraft.LTR,
        MODEL: editDraft.MODEL,
        COLOUR: editDraft.COLOUR,
        WEIGHT: Number(editDraft.WEIGHT) || 0,
        PRODUCTION: Number(editDraft.PRODUCTION) || 0,
        shift_time: editDraft.shift_time || 'Day',
      });
      setEditingRowId(null);
      fetchMachineData();
    } catch (err) {
      console.error('Error updating consent row', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete row ───────────────────────────────────────────────────────────────
  const handleDeleteRow = async (rowId) => {
    if (!window.confirm('Delete this consent row?')) return;
    try {
      await deleteConsentRow(id, rowId);
      fetchMachineData();
    } catch (err) {
      console.error('Error deleting consent row', err);
    }
  };



  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <h2 style={{ color: 'var(--text-secondary)' }}>Loading Machine Data...</h2>
      </div>
    );
  }

  if (!machine) return <h2>Machine Not Found</h2>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '600' }}>Machine {id} Control Panel</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage material configurations and layer specific constraints.</p>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontWeight: '500', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* ── Consent Data ── */}
      <section className="glass-panel" style={{ margin: 0 }}>
        {/* Header */}
        <div className="glass-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '600' }}>Consent Data</h2>
          <button
            className="btn btn-primary"
            onClick={() => { setShowAddForm(true); setNewRow({ ...BLANK_ROW }); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={16} /> Add LTR
          </button>
        </div>

        {/* ── Add LTR Form ── */}
        {showAddForm && (
          <div style={{
            margin: '0 1.25rem 1rem',
            padding: '1rem 1.25rem',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: '10px',
          }}>
            <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#a5b4fc', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              New LTR Entry
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '0.9rem' }}>
              {['shift_time', 'LTR', 'MODEL', 'COLOUR', 'WEIGHT', 'PRODUCTION'].map(field => (
                <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field === 'shift_time' ? 'SHIFT TIME' : field}</label>
                  {field === 'shift_time' ? (
                    <select
                      name={field}
                      value={newRow[field]}
                      onChange={e => setNewRow(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: newRow[field] === 'Night' ? '#60A5FA' : '#FBBF24', fontWeight: '600', width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="Day" style={{ color: '#FBBF24', background: '#1e293b' }}>Day</option>
                      <option value="Night" style={{ color: '#60A5FA', background: '#1e293b' }}>Night</option>
                    </select>
                  ) : (
                    <input
                      type={['WEIGHT', 'PRODUCTION'].includes(field) ? 'number' : 'text'}
                      name={field}
                      value={newRow[field]}
                      onChange={e => setNewRow(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                      placeholder={field === 'shift_time' ? 'SHIFT TIME' : field}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', width: '100%', boxSizing: 'border-box' }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}>
                <X size={15} /> Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddRow} disabled={saving}>
                <Save size={15} /> {saving ? 'Saving…' : 'Save Row'}
              </button>
            </div>
          </div>
        )}

        {/* ── Consent Rows Table ── */}
        {consentRows.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
            No consent rows yet — click <strong style={{ color: '#a5b4fc' }}>Add LTR</strong> to add one.
          </div>
        ) : (
          <div className="scroll-table-container" style={{ padding: '0 0 0.5rem' }}>
            <table>
              <thead>
                <tr>
                  {['SHIFT TIME', 'LTR', 'MODEL', 'COLOUR', 'WEIGHT', 'PRODUCTION', 'Actions'].map(h => (
                    <th key={h} style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', letterSpacing: '0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {consentRows.map((row) => {
                  const isEditing = editingRowId === row._id;
                  const inputStyle = {
                    padding: '0.3rem 0.5rem', fontSize: '0.88rem', borderRadius: '5px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white', width: '100%', boxSizing: 'border-box',
                  };
                  return (
                    <tr key={row._id} style={{ background: isEditing ? 'rgba(99,102,241,0.08)' : undefined }}>
                      {['shift_time', 'LTR', 'MODEL', 'COLOUR', 'WEIGHT', 'PRODUCTION'].map(field => (
                        <td key={field}>
                          {isEditing ? (
                            field === 'shift_time' ? (
                              <select
                                name={field}
                                value={editDraft[field] ?? 'Day'}
                                onChange={handleEditDraft}
                                style={{ ...inputStyle, color: (editDraft[field] ?? 'Day') === 'Night' ? '#60A5FA' : '#FBBF24', fontWeight: '600' }}
                              >
                                <option value="Day" style={{ color: '#FBBF24', background: '#1e293b' }}>Day</option>
                                <option value="Night" style={{ color: '#60A5FA', background: '#1e293b' }}>Night</option>
                              </select>
                            ) : (
                              <input
                                type={['WEIGHT', 'PRODUCTION'].includes(field) ? 'number' : 'text'}
                                name={field}
                                value={editDraft[field] ?? ''}
                                onChange={handleEditDraft}
                                style={inputStyle}
                              />
                            )
                          ) : (
                            <span style={{ fontWeight: '600', color: field === 'shift_time' ? (row[field] === 'Night' ? '#60A5FA' : '#FBBF24') : 'white' }}>
                              {row[field] || ((['WEIGHT', 'PRODUCTION'].includes(field)) ? '0' : '–')}
                            </span>
                          )}
                        </td>
                      ))}
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {isEditing ? (
                            <>
                              <button className="btn btn-primary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }} onClick={() => saveEdit(row._id)} disabled={saving}>
                                <Save size={13} /> {saving ? '…' : 'Save'}
                              </button>
                              <button className="btn btn-ghost" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }} onClick={() => setEditingRowId(null)}>
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-ghost" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }} onClick={() => startEdit(row)} title="Edit row">
                                <Edit2 size={13} />
                              </button>
                              <button
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                onClick={() => handleDeleteRow(row._id)} title="Delete row"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>


      {/* ── Material Layers ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '500', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>Material Layers</h3>

        {/* Inner Layer */}
        <LayerErrorBoundary key={`inner-${id}`}>
          <LayerTable machineId={id} layerName="inner" initialData={machine.inner} onDataChange={setLiveInner} onSaveComplete={fetchMachineData} />
        </LayerErrorBoundary>

        {/* Middle Layer */}
        <LayerErrorBoundary key={`middle-${id}`}>
          <LayerTable machineId={id} layerName="middle" initialData={machine.middle} onDataChange={setLiveMiddle} onSaveComplete={fetchMachineData} />
        </LayerErrorBoundary>

        {/* Outer Layer */}
        <LayerErrorBoundary key={`outer-${id}`}>
          <LayerTable machineId={id} layerName="outer" initialData={machine.outer} onDataChange={setLiveOuter} onSaveComplete={fetchMachineData} />
        </LayerErrorBoundary>
      </div>

      {/* Overall Summary Totals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '500', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>Overall Summary Totals</h3>
        <OverallSummaryTable
          innerData={liveInner}
          middleData={liveMiddle}
          outerData={liveOuter}
          consentData={consentRows}
        />
      </div>

      {/* Material Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
        <MaterialBreakdownTable
          innerData={liveInner}
          middleData={liveMiddle}
          outerData={liveOuter}
        />
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
