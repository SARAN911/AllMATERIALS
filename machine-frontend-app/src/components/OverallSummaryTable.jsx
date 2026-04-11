import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * OverallSummaryTable
 * Calculates and displays an overall totals row based on all three layers.
 *
 * Formula logic (mirrors Excel sheet):
 *  - TOTAL MATERIAL     = SUM of numeric values in each row across all layers
 *  - INNER VIRGIN       = SUM of OO3 + 002 numeric values in inner layer
 *  - OUTER VIRGIN       = SUM of OO3 + 002 (or 003 + 002) numeric values in outer layer
 *  - T.LTRS (Production)= SUM of T.LTRS / production numeric field across layers
 *  - INNER AVG VIRGIN   = INNER VIRGIN / T.LTRS
 *  - OUTER AVG VIRGIN   = OUTER VIRGIN / T.LTRS
 *  - AVG / LTR          = (INNER VIRGIN + OUTER VIRGIN) / T.LTRS
 *  - AVG WEIGHT         = (Total Material / T.LTRS) * 1000
 *  - APP. MATERIAL      = WEIGHT * (T.LTRS / LTR)
 */

// Helper to safely get a number from an item field
const safeNum = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};

const fmt = (num, decimals = 4) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  if (!isFinite(num)) return '#DIV/0!';
  return parseFloat(num.toFixed(decimals)).toString();
};

const OverallSummaryTable = ({ innerData = [], middleData = [], outerData = [], consentData = {} }) => {
  const allData = [...innerData, ...middleData, ...outerData];

  // Support both old single-object and new array formats
  const firstConsent = Array.isArray(consentData) ? (consentData[0] || {}) : consentData;

  // Helper to find a field matching keywords and return its numeric value
  const getFieldVal = (item, keywords) => {
    if (!item) return 0;
    for (const key of Object.keys(item)) {
      const upperKey = key.toUpperCase();
      if (keywords.some(kw => upperKey.includes(kw))) {
        return safeNum(item[key]);
      }
    }
    return 0;
  };

  const LTR = safeNum(firstConsent?.LTR) || 1;
  const PROD = safeNum(firstConsent?.PRODUCTION) || 0;
  const WEIGHT = safeNum(firstConsent?.WEIGHT) || 0;


  let totalMaterial = 0;

  // T.LTRS = PRODUCTION * 1000
  const tLtrsTotal = PROD * 1000;

  // Ratio for unit calculations
  const ratioTotal = (LTR > 0 && tLtrsTotal > 0) ? (tLtrsTotal / LTR) : 0;

  allData.forEach(item => {
    Object.keys(item).forEach(key => {
      // Exclude system keys, only sum numeric layer fields
      if (!['_id', '_tempId', '_isUpdated', 'shift_time', 'material_name', 'createdAt', 'updatedAt', '__v'].includes(key)) {
        totalMaterial += safeNum(item[key]);
      }
    });
  });

  // Calculate inner & outer virgin specific columns
  const virginSumKeys = ['OO3', '003', 'PS 148', 'EQUATE', 'PS LD', '002'];

  let innerVirgin = 0;
  innerData.forEach(item => {
    virginSumKeys.forEach(k => {
      innerVirgin += safeNum(item[k]);
    });
  });

  let outerVirgin = 0;
  outerData.forEach(item => {
    virginSumKeys.forEach(k => {
      outerVirgin += safeNum(item[k]);
    });
  });

  // Derived formulas
  const innerAvgVirgin = tLtrsTotal > 0 ? (innerVirgin / tLtrsTotal) : null;
  const outerAvgVirgin = tLtrsTotal > 0 ? (outerVirgin / tLtrsTotal) : null;
  const avgPerLtr = tLtrsTotal > 0 ? ((innerVirgin + outerVirgin) / tLtrsTotal) : null;

  // AVG WEIGHT = TOTAL MATERIAL ÷ Ratio
  const avgWeight = ratioTotal > 0 ? (totalMaterial / ratioTotal) : null;

  // APP. MATERIAL = WEIGHT * Ratio
  const displayAppWeight = ratioTotal > 0 ? (WEIGHT * ratioTotal) : null;

  // ── Column definitions for the summary table ───────────────────────────────
  const columns = [
    {
      key: 'total_material',
      label: 'TOTAL MATERIAL',
      value: totalMaterial,
      format: (v) => fmt(v, 2),
      highlight: 'primary',
      tooltip: 'Σ Production (all batches in group)',
    },
    {
      key: 'inner_virgin',
      label: 'INNER VIRGIN',
      value: innerVirgin,
      format: (v) => fmt(v, 2),
      highlight: 'success',
      tooltip: 'Sum of OO3 and 002 for Inner Layer',
    },
    {
      key: 'outer_virgin',
      label: 'OUTER VIRGIN',
      value: outerVirgin,
      format: (v) => fmt(v, 2),
      highlight: 'success',
      tooltip: 'Sum of OO3 and 002 for Outer Layer',
    },
    {
      key: 't_ltrs',
      label: 'T.LTRS',
      value: tLtrsTotal,
      format: (v) => fmt(v, 0),
      highlight: 'warning',
      tooltip: 'Total Production Volume across all layers',
    },
    {
      key: 'inner_avg_virgin',
      label: 'INNER AVG VIRGIN',
      value: innerAvgVirgin,
      format: (v) => (v === null ? '#DIV/0!' : fmt(v, 4)),
      highlight: 'accent',
      isDivide: innerAvgVirgin === null,
      tooltip: 'INNER VIRGIN ÷ T.LTRS',
    },
    {
      key: 'outer_avg_virgin',
      label: 'OUTER AVG VIRGIN',
      value: outerAvgVirgin,
      format: (v) => (v === null ? '#DIV/0!' : fmt(v, 4)),
      highlight: 'accent',
      isDivide: outerAvgVirgin === null,
      tooltip: 'OUTER VIRGIN ÷ T.LTRS',
    },
    {
      key: 'avg_ltr',
      label: 'AVG/ LTR',
      value: avgPerLtr,
      format: (v) => (v === null ? '#DIV/0!' : fmt(v, 4)),
      highlight: 'purple',
      isDivide: avgPerLtr === null,
      tooltip: '(INNER + OUTER VIRGIN) ÷ T.LTRS',
    },
    {
      key: 'avg_weight',
      label: 'AVG WEIGHT',
      value: avgWeight,
      format: (v) => (v === null ? '#DIV/0!' : fmt(v, 3)),
      highlight: 'primary',
      isDivide: avgWeight === null,
      tooltip: 'Σ(Weight × Production) ÷ TOTAL MATERIAL',
    },
    {
      key: 'app_material',
      label: 'APP. MATERIAL',
      value: displayAppWeight,
      format: (v) => (v === null ? '#DIV/0!' : fmt(v, 4)),
      highlight: 'blue',
      isDivide: displayAppWeight === null,
      tooltip: 'WEIGHT × (T.LTRS / LTR)',
    },
  ];

  const highlightColors = {
    primary: { bg: 'rgba(99,102,241,0.18)', border: 'rgba(99,102,241,0.45)', text: '#a5b4fc' },
    blue:    { bg: 'rgba(59,130,246,0.18)',  border: 'rgba(59,130,246,0.45)',  text: '#93c5fd' },
    purple:  { bg: 'rgba(168,85,247,0.18)',  border: 'rgba(168,85,247,0.45)',  text: '#d8b4fe' },
    success: { bg: 'rgba(16,185,129,0.18)',  border: 'rgba(16,185,129,0.45)',  text: '#6ee7b7' },
    warning: { bg: 'rgba(245,158,11,0.18)',  border: 'rgba(245,158,11,0.45)',  text: '#fcd34d' },
    accent:  { bg: 'rgba(236,72,153,0.18)',  border: 'rgba(236,72,153,0.45)',  text: '#f9a8d4' },
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', marginTop: '0.5rem' }}>
      {/* Header */}
      <div
        className="glass-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(168,85,247,0.15) 100%)',
          borderBottom: '1px solid rgba(99,102,241,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}
          >
            <BarChart3 size={18} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'white', marginBottom: '2px' }}>
              Overall Summary Totals
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Aggregated across Inner · Middle · Outer layers &nbsp;·&nbsp; Weighted ratio calculations
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <StatPill label="Total Material" value={fmt(totalMaterial, 2)} color="#a5b4fc" />
          <StatPill label="T.LTRS"         value={fmt(tLtrsTotal, 0)}    color="#fcd34d" />
          <StatPill label="Avg Weight"     value={avgWeight === null ? '#DIV/0!' : fmt(avgWeight, 3)} color="#6ee7b7" />
        </div>
      </div>

      {/* Cards grid */}
      <div
        style={{
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '1rem',
        }}
      >
        {columns.map((col) => {
          const colors = highlightColors[col.highlight] || highlightColors.primary;
          const displayVal = col.format(col.value);
          const isError = displayVal === '#DIV/0!';

          return (
            <div
              key={col.key}
              title={col.tooltip}
              style={{
                background: isError ? 'rgba(239,68,68,0.12)' : colors.bg,
                border: `1px solid ${isError ? 'rgba(239,68,68,0.35)' : colors.border}`,
                borderRadius: '12px',
                padding: '1rem 1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${isError ? 'rgba(239,68,68,0.2)' : colors.border.replace('0.45', '0.3')}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isError ? '#fca5a5' : colors.text,
                }}
              >
                {col.label}
              </span>
              <span
                style={{
                  fontSize: isError ? '1rem' : '1.3rem',
                  fontWeight: '700',
                  color: isError ? '#ef4444' : 'white',
                  lineHeight: 1.2,
                  wordBreak: 'break-all',
                }}
              >
                {displayVal}
              </span>
              {!isError && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.38)',
                    display: 'block',
                    marginTop: '2px',
                  }}
                >
                  {col.tooltip}
                </span>
              )}
              {isError && (
                <span style={{ fontSize: '0.65rem', color: '#fca5a5' }}>
                  T.LTRS = 0 — Add production values to rows
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Formula Reference Row */}
      <div
        style={{
          margin: '0 1.5rem 1.5rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '0.9rem 1.2rem',
        }}
      >
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.8 }}>
          <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Formula Reference: </strong>
          INNER VIRGIN = OO3 ... 002 (Inner Layer) &nbsp;|&nbsp;
          OUTER VIRGIN = OO3 ... 002 (Outer Layer) &nbsp;|&nbsp;
          INNER AVG VIRGIN = INNER VIRGIN ÷ T.LTRS &nbsp;|&nbsp;
          OUTER AVG VIRGIN = OUTER VIRGIN ÷ T.LTRS &nbsp;|&nbsp;
          AVG / LTR = (INNER + OUTER VIRGIN) ÷ T.LTRS
        </p>
      </div>

      {/* Full summary table */}
      <div className="scroll-table-container" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} title={col.tooltip} style={{ whiteSpace: 'nowrap' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))' }}>
              {columns.map((col) => {
                const displayVal = col.format(col.value);
                const isError = displayVal === '#DIV/0!';
                return (
                  <td
                    key={col.key}
                    style={{
                      fontWeight: '700',
                      fontSize: '1rem',
                      color: isError ? '#ef4444' : 'white',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {displayVal}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Small pill badge for header
const StatPill = ({ label, value, color }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '0.35rem 0.75rem',
      minWidth: '90px',
    }}
  >
    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
    <span style={{ fontSize: '0.9rem', fontWeight: '700', color }}>
      {value}
    </span>
  </div>
);

export default OverallSummaryTable;
