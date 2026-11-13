'use client';

import { motion } from 'framer-motion';
import type { AnalysisResult } from '@/types/analysis';

interface Props {
  analysis: AnalysisResult;
}

export default function CorrelationsTab({ analysis }: Props) {
  const { numCols, corrMatrix, corrSampleSizes } = analysis;

  if (numCols.length < 2) {
    return (
      <div
        className="rounded-[18px] p-12 text-center"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(45,40,32,0.10)',
          color: '#a09890',
          fontSize: '0.9rem',
        }}
      >
        Need at least 2 numeric columns for correlation analysis.
      </div>
    );
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))' }}>
      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="min-w-0 rounded-[18px] p-6"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(45,40,32,0.10)',
          boxShadow: '0 2px 16px rgba(45,40,32,0.07)',
        }}
      >
        <div className="font-medium mb-1" style={{ fontSize: '0.92rem', color: '#2d2820' }}>
          Correlation matrix
        </div>
        <div className="text-xs mb-4" style={{ color: '#a09890' }}>
          Pearson r using pairwise-complete rows. n = rows with valid values in both features.
        </div>
        <CorrHeatmap numCols={numCols} corrMatrix={corrMatrix} corrSampleSizes={corrSampleSizes} />
        <p className="text-xs mt-3" style={{ color: '#7a7068' }}>
          N/A = fewer than 2 paired rows or no variation in either feature.
        </p>
      </motion.div>

      {/* Top pairs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 28 }}
        className="min-w-0 rounded-[18px] p-6"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(45,40,32,0.10)',
          boxShadow: '0 2px 16px rgba(45,40,32,0.07)',
        }}
      >
        <div className="font-medium mb-1" style={{ fontSize: '0.92rem', color: '#2d2820' }}>
          Top correlations
        </div>
        <div className="text-xs mb-4" style={{ color: '#a09890' }}>
          Strongest feature relationships
        </div>
        <TopCorrList numCols={numCols} corrMatrix={corrMatrix} corrSampleSizes={corrSampleSizes} />
      </motion.div>
    </div>
  );
}

function corrColor(r: number | null): string {
  if (r === null) return 'rgba(45,40,32,0.07)';
  const abs = Math.abs(r);
  if (r > 0) {
    const alpha = 0.1 + abs * 0.85;
    return `rgba(196, 77, 106, ${alpha})`;
  } else {
    const alpha = 0.1 + abs * 0.85;
    return `rgba(45, 106, 150, ${alpha})`;
  }
}

function CorrHeatmap({
  numCols,
  corrMatrix,
  corrSampleSizes,
}: {
  numCols: string[];
  corrMatrix: AnalysisResult['corrMatrix'];
  corrSampleSizes: AnalysisResult['corrSampleSizes'];
}) {
  const cols = numCols.slice(0, 10); // max 10×10

  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        role="table"
        aria-label="Pearson correlation matrix with paired sample sizes"
        style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${cols.length}, minmax(68px, 1fr))`,
          gap: '2px',
          minWidth: cols.length * 70 + 80,
        }}
      >
        {/* Header row */}
        <div role="row" style={{ display: 'contents' }}>
          <div role="columnheader" />
          {cols.map(col => (
            <div
              key={col}
              role="columnheader"
              aria-label={col}
              className="text-center truncate"
              style={{ fontSize: '12px', color: '#7a7068', padding: '2px', fontWeight: 500 }}
              title={col}
            >
              {col.length > 7 ? col.slice(0, 6) + '…' : col}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {cols.map((row, ri) => (
          <div key={row} role="row" style={{ display: 'contents' }}>
            <div
              role="rowheader"
              aria-label={row}
              className="flex items-center justify-end pr-2 truncate"
              style={{ fontSize: '12px', color: '#7a7068', fontWeight: 500 }}
              title={row}
            >
              {row.length > 9 ? row.slice(0, 8) + '…' : row}
            </div>

            {cols.map((col, ci) => {
              const r = corrMatrix[row]?.[col] ?? null;
              const n = corrSampleSizes[row][col];
              const label = `${row} × ${col}: ${r === null ? 'N/A' : `r = ${r.toFixed(3)}`}, n = ${n} paired rows`;

              return (
                <motion.div
                  key={`${row}-${col}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (ri * cols.length + ci) * 0.008 }}
                  className="corr-cell"
                  role="cell"
                  aria-label={label}
                  style={{
                    background: corrColor(r),
                    color: r !== null && Math.abs(r) > 0.7 ? '#ffffff' : '#2d2820',
                    aspectRatio: 'auto',
                    minHeight: '56px',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'default',
                  }}
                  title={label}
                >
                  <span>{r === null ? 'N/A' : r.toFixed(2)}</span>
                  <span className="font-mono">n={n}</span>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 mt-4 justify-center">
        <div
          className="w-20 h-2 rounded-full"
          style={{
            background: 'linear-gradient(90deg, rgba(45,106,150,0.9), rgba(45,106,150,0.1), rgba(196,77,106,0.1), rgba(196,77,106,0.9))',
          }}
        />
        <div className="flex gap-4 text-xs" style={{ color: '#a09890' }}>
          <span>−1 negative</span>
          <span>0</span>
          <span>+1 positive</span>
        </div>
      </div>
    </div>
  );
}

function TopCorrList({
  numCols,
  corrMatrix,
  corrSampleSizes,
}: {
  numCols: string[];
  corrMatrix: AnalysisResult['corrMatrix'];
  corrSampleSizes: AnalysisResult['corrSampleSizes'];
}) {
  const pairs: Array<{ a: string; b: string; r: number; n: number }> = [];

  numCols.forEach(c1 =>
    numCols.forEach(c2 => {
      if (c1 >= c2) return;
      const r = corrMatrix[c1]?.[c2];
      if (r != null) pairs.push({ a: c1, b: c2, r, n: corrSampleSizes[c1][c2] });
    })
  );

  const top = pairs.sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, 8);

  if (!top.length) {
    return <p className="text-sm" style={{ color: '#7a7068' }}>No correlations available. Each pair needs at least 2 valid rows and variation in both features.</p>;
  }

  const maxAbs = Math.max(...top.map(p => Math.abs(p.r))) || 1;

  return (
    <div className="flex flex-col gap-2.5">
      {top.map((pair, i) => (
        <motion.div
          key={`${pair.a}-${pair.b}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col gap-1"
        >
          <div className="flex justify-between items-center">
            <span className="min-w-0 text-xs font-medium break-words" style={{ color: '#2d2820', overflowWrap: 'anywhere' }}>
              {pair.a} × {pair.b}
            </span>
            <span
              className="text-xs font-medium font-mono ml-2 flex-shrink-0"
              style={{ color: pair.r >= 0 ? '#c44d6a' : '#2d6a96' }}
            >
              {pair.r > 0 ? '+' : ''}{pair.r.toFixed(3)}
            </span>
          </div>
          <span className="text-xs font-mono" style={{ color: '#7a7068' }}>n = {pair.n} paired rows</span>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(45,40,32,0.07)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(Math.abs(pair.r) / maxAbs) * 100}%` }}
              transition={{ delay: i * 0.05 + 0.15, duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: pair.r >= 0
                  ? 'linear-gradient(90deg, #e8778f, #c44d6a)'
                  : 'linear-gradient(90deg, #6a9fc4, #2d6a96)',
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
