import React from 'react';
import { calculateCableSizing } from '../utils/engineering/cableSizing';
import { BREAKER_SIZES } from '../constants/engineeringConstants';

const SingleLineDiagram = ({ loads, mainBreaker, mainFeeder, systemPhase = 3 }) => {
  // Constants for drawing
  const nodeWidth = 140;
  const nodeSpacing = 160;
  const startX = 50;
  const busbarY = 150;
  const svgWidth = Math.max(800, (loads.length * nodeSpacing) + startX + 50);
  const svgHeight = 450;

  return (
    <div className="equipment-card" style={{ padding: '2rem', marginTop: '2rem', overflowX: 'auto', background: 'var(--bg-secondary)', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Single Line Diagram (SLD)</h3>
        <span className="print-only" style={{ fontSize: '0.85rem', color: '#666' }}>MDB Overview</span>
      </div>
      
      <div style={{ minWidth: '800px', paddingBottom: '1rem' }}>
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          
          {/* --- Grid / Background --- */}
          <rect width="100%" height="100%" fill="transparent" />

          {/* --- Main Incoming Line --- */}
          {/* Vertical line from top to busbar */}
          <line x1={startX + 60} y1="20" x2={startX + 60} y2={busbarY} stroke="var(--accent-primary)" strokeWidth="4" />
          
          {/* Transformer / Source Icon */}
          <circle cx={startX + 60} cy="40" r="15" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" />
          <circle cx={startX + 60} cy="60" r="15" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" />
          
          {/* Main Breaker Box */}
          <rect x={startX + 40} y="85" width="40" height="25" fill="var(--bg-tertiary)" stroke="var(--text-primary)" strokeWidth="2" rx="4" />
          <text x={startX + 60} y="102" fontSize="12" fill="var(--text-primary)" textAnchor="middle" fontWeight="bold">CB</text>

          {/* Main Labels */}
          <text x={startX + 90} y="55" fontSize="14" fill="var(--accent-secondary)" fontWeight="bold">MDB Main</text>
          <text x={startX + 90} y="92" fontSize="12" fill="var(--text-primary)">{mainBreaker ? `${mainBreaker} AT` : 'N/A'}</text>
          <text x={startX + 90} y="108" fontSize="12" fill="var(--text-secondary)">{systemPhase === 3 ? '3-Phase' : '1-Phase'}</text>
          <text x={startX + 90} y="125" fontSize="12" fill="var(--accent-primary)">Feeder: {mainFeeder || 'THW ...'}</text>

          {/* --- Main Busbar --- */}
          <line x1={startX} y1={busbarY} x2={svgWidth - 20} y2={busbarY} stroke="var(--accent-primary)" strokeWidth="8" strokeLinecap="round" />
          <text x={startX} y={busbarY - 10} fontSize="14" fill="var(--text-primary)" fontWeight="bold">Main Busbar</text>

          {/* --- Branch Circuits --- */}
          {loads.map((load, index) => {
            const cx = startX + 60 + (index * nodeSpacing);
            const cableInfo = calculateCableSizing(load.current, load.name);
            const branchBreakerSize = cableInfo ? cableInfo.breakerSize : '?';
            const cableSize = cableInfo ? cableInfo.cableSize : '?';
            
            return (
              <g key={load.id}>
                {/* Drop line from busbar */}
                <line x1={cx} y1={busbarY} x2={cx} y2={busbarY + 180} stroke="var(--text-primary)" strokeWidth="2" />
                
                {/* Connection Dot */}
                <circle cx={cx} cy={busbarY} r="4" fill="var(--accent-primary)" />

                {/* Branch Breaker */}
                <rect x={cx - 15} y={busbarY + 30} width="30" height="20" fill="var(--bg-tertiary)" stroke="var(--text-primary)" strokeWidth="2" rx="2" />
                <line x1={cx - 8} y1={busbarY + 45} x2={cx + 8} y2={busbarY + 35} stroke="var(--text-primary)" strokeWidth="2" />
                
                {/* Breaker Label */}
                <text x={cx + 25} y={busbarY + 45} fontSize="12" fill="var(--text-primary)" fontWeight="bold">{branchBreakerSize} AT</text>
                
                {/* Cable Label */}
                <text x={cx + 10} y={busbarY + 90} fontSize="11" fill="var(--accent-primary)">
                  THW {cableSize} sq.mm
                </text>
                <text x={cx + 10} y={busbarY + 105} fontSize="11" fill="var(--text-secondary)">
                  ({load.phase})
                </text>

                {/* Load Box */}
                <rect x={cx - 40} y={busbarY + 180} width="80" height="40" fill="rgba(59, 130, 246, 0.1)" stroke="var(--accent-primary)" strokeWidth="2" rx="4" />
                <text x={cx} y={busbarY + 198} fontSize="12" fill="var(--text-primary)" textAnchor="middle" fontWeight="bold">
                  {load.name.length > 12 ? load.name.substring(0, 10) + '...' : load.name}
                </text>
                <text x={cx} y={busbarY + 212} fontSize="11" fill="var(--text-secondary)" textAnchor="middle">
                  {load.current} A
                </text>
              </g>
            );
          })}
          
          {loads.length === 0 && (
            <text x={svgWidth / 2} y={busbarY + 100} fontSize="14" fill="var(--text-secondary)" textAnchor="middle">
              เพิ่มรายการโหลดเพื่อแสดงแผนผัง Single Line Diagram
            </text>
          )}
        </svg>
      </div>
      <div className="no-print" style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        * การจับคู่ขนาดเบรกเกอร์ลูกย่อยและสายไฟใน SLD นี้ คำนวณตามมาตรฐาน (CB 10A-1.5, 16A-2.5, 20A-4 ฯลฯ)
      </div>
    </div>
  );
};

export default SingleLineDiagram;
