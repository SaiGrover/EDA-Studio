'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult } from '@/types/analysis';

interface Props {
  analysis: AnalysisResult;
}

export default function CorrelationsTab({ analysis }: Props) {
  const { numCols, corrMatrix } = analysis;

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
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="rounded-[18px] p-6 overflow-x-auto"
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
          Pearson correlation between numeric features
        </div>
        <CorrHeatmap numCols={numCols} corrMatrix={corrMatrix} />
      </motion.div>

      {/* Top pairs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 28 }}
        className="rounded-[18px] p-6"
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
        <TopCorrList numCols={numCols} corrMatrix={corrMatrix} />
      </motion.div>
    </div>
  );
}

function corrColor(r: number): string {
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
}: {
  numCols: string[];
  corrMatrix: Record<string, Record<string, number>>;
}) {
  const cols = numCols.slice(0, 10); // max 10×10

  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${cols.length}, 1fr)`,
          gap: '2px',
          minWidth: cols.length * 48 + 80,
        }}
      >
        {/* Header row */}
        <div />
        {cols.map(col => (
          <div
            key={col}
            className="text-center truncate"
            style={{ fontSize: '9px', color: '#a09890', padding: '2px', fontWeight: 500 }}
            title={col}
          >
            {col.length > 7 ? col.slice(0, 6) + '…' : col}
          </div>
        ))}

        {/* Data rows */}
        {cols.map((row, ri) => (
          <div key={row} style={{ display: 'contents' }}>
            <div
              className="flex items-center justify-end pr-2 truncate"
              style={{ fontSize: '9px', color: '#a09890', fontWeight: 500 }}
              title={row}
            >
              {row.length > 9 ? row.slice(0, 8) + '…' : row}
            </div>

            {cols.map((col, ci) => {
              const r = corrMatrix[row]?.[col] ?? 0;

              return (
                <motion.div
                  key={`${row}-${col}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (ri * cols.length + ci) * 0.008 }}
                  className="corr-cell"
                  style={{
                    background: corrColor(r),
                    color: Math.abs(r) > 0.5 ? '#ffffff' : '#2d2820',
                    aspectRatio: '1',
                    height: '40px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 500,
                    cursor: 'default',
                  }}
                  title={`${row} × ${col}: ${r.toFixed(3)}`}
                >
                  {Math.abs(r) > 0.15 ? r.toFixed(2) : ''}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-center">
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
}: {
  numCols: string[];
  corrMatrix: Record<string, Record<string, number>>;
}) {
  const pairs: Array<{ a: string; b: string; r: number }> = [];

  numCols.forEach(c1 =>
    numCols.forEach(c2 => {
      if (c1 >= c2) return;
      pairs.push({ a: c1, b: c2, r: corrMatrix[c1]?.[c2] ?? 0 });
    })
  );

  const top = pairs.sort((a, b) => Math.abs(b.r) - Math.abs(a.r)).slice(0, 8);

  if (!top.length) {
    return <p className="text-sm" style={{ color: '#a09890' }}>No pairs available.</p>;
  }

  const maxAbs = Math.max(...top.map(p => Math.abs(p.r)));

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
            <span className="text-xs font-medium truncate max-w-[180px]" style={{ color: '#2d2820' }}>
              {pair.a} × {pair.b}
            </span>
            <span
              className="text-xs font-medium font-mono ml-2 flex-shrink-0"
              style={{ color: pair.r >= 0 ? '#c44d6a' : '#2d6a96' }}
            >
              {pair.r > 0 ? '+' : ''}{pair.r.toFixed(3)}
            </span>
          </div>
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
