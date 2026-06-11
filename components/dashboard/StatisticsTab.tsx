'use client';

import { motion } from 'framer-motion';
import type { AnalysisResult } from '@/types/analysis';

interface Props {
  analysis: AnalysisResult;
}

export default function StatisticsTab({ analysis }: Props) {
  const { cols, colInfo } = analysis;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="rounded-[18px] overflow-hidden"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(45,40,32,0.10)',
        boxShadow: '0 2px 16px rgba(45,40,32,0.07)',
      }}
    >
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#faf7f2', borderBottom: '1px solid rgba(45,40,32,0.10)' }}>
              {['Column', 'Type', 'Non-null', 'Missing %', 'Unique', 'Min / Top', 'Max / Freq', 'Mean', 'Std Dev', 'Skew'].map(h => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontWeight: 500,
                    color: '#a09890',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cols.map((col, i) => {
              const info = colInfo[col];
              const isNum = info.type === 'numeric';
              return (
                <motion.tr
                  key={col}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  style={{ borderBottom: '1px solid rgba(45,40,32,0.07)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#faf7f2'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '8px 14px', fontWeight: 500, color: '#2d2820', fontFamily: "'DM Mono', monospace", fontSize: '0.78rem' }}>
                    {col}
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <TypeBadge type={info.type} />
                  </td>
                  <td style={{ padding: '8px 14px', color: '#2d2820' }}>
                    {isNum
                      ? info.nonNull.length.toLocaleString()
                      : (Object.values(info.freq).reduce((a, b) => a + b, 0)).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <NullBar pct={info.nullPct} />
                  </td>
                  <td style={{ padding: '8px 14px', color: '#2d2820' }}>
                    {info.unique.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 14px', color: '#2d2820', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }}>
                    {isNum ? info.min.toFixed(2) : info.topValues[0]?.[0] ?? '—'}
                  </td>
                  <td style={{ padding: '8px 14px', color: '#2d2820', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }}>
                    {isNum ? info.max.toFixed(2) : (info.topValues[0]?.[1] ?? '—')}
                  </td>
                  <td style={{ padding: '8px 14px', color: '#2d2820', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }}>
                    {isNum ? info.mean.toFixed(3) : '—'}
                  </td>
                  <td style={{ padding: '8px 14px', color: '#2d2820', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }}>
                    {isNum ? info.std.toFixed(3) : '—'}
                  </td>
                  <td style={{ padding: '8px 14px', color: isNum && Math.abs(info.skewness) > 1 ? '#c44d6a' : '#2d2820', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }}>
                    {isNum ? info.skewness.toFixed(3) : '—'}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, [string, string]> = {
    numeric: ['#eef4f9', '#2d6a96'],
    categorical: ['#f3f0fb', '#5e4aaa'],
    boolean: ['#fef5ef', '#9a5520'],
  };
  const [bg, color] = styles[type] ?? ['#faf7f2', '#6b6258'];
  return (
    <span
      className="inline-block rounded-full text-xs font-medium"
      style={{ background: bg, color, padding: '2px 9px', fontSize: '0.7rem' }}
    >
      {type}
    </span>
  );
}

function NullBar({ pct }: { pct: number }) {
  const color = pct > 30 ? '#c44d6a' : pct > 10 ? '#d4894a' : '#6fa896';
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-20 rounded-full"
        style={{ background: 'rgba(45,40,32,0.08)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span style={{ fontSize: '0.72rem', color: '#6b6258', minWidth: '36px' }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}
