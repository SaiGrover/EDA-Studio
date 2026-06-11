'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import type { DataRow } from '@/types/analysis';
import { generateSampleData } from '@/lib/analysis';

interface Props {
  onDataReady: (rows: DataRow[], cols: string[], fileName: string) => void;
}

const FEATURE_PILLS = [
  { label: 'Smart pattern detection', color: '#e8778f' },
  { label: 'Distribution analysis', color: '#6fa896' },
  { label: 'Correlation heatmap', color: '#9b89d4' },
  { label: 'Jupyter notebook export', color: '#c9a87a' },
  { label: 'Outlier detection', color: '#6a9fc4' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export default function LandingPage({ onDataReady }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError('');
      const name = file.name.replace(/\.[^.]+$/, '');
      const ext = file.name.split('.').pop()?.toLowerCase();

      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result as string;
        try {
          if (ext === 'json') {
            const json = JSON.parse(content);
            const rawRows: DataRow[] = Array.isArray(json)
              ? json
              : json.data || Object.values(json)[0] || [];
            if (!rawRows.length) throw new Error('No rows found');
            onDataReady(rawRows, Object.keys(rawRows[0]), name);
          } else {
            const delim = ext === 'tsv' ? '\t' : ',';
            Papa.parse<DataRow>(content, {
              header: true,
              dynamicTyping: true,
              skipEmptyLines: true,
              delimiter: delim,
              complete: r => {
                if (!r.data.length) { setError('No data found in file.'); return; }
                onDataReady(r.data, Object.keys(r.data[0]), name);
              },
            });
          }
        } catch (err) {
          setError(`Could not parse file: ${(err as Error).message}`);
        }
      };
      reader.readAsText(file);
    },
    [onDataReady]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleSample() {
    const data = generateSampleData();
    onDataReady(data, Object.keys(data[0]), 'sample_sales');
  }

  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
    >
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,168,184,0.25) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, -25, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(197,184,232,0.2) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(168,197,184,0.10) 0%, transparent 70%)' }}
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center w-full max-w-xl relative z-10"
      >
        {/* Logo */}
        <motion.div variants={item} className="mb-8 flex flex-col items-center">
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
            className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center mb-4 gradient-border-animated"
            style={{
              background: 'linear-gradient(135deg, #fdf0f3 0%, #f3f0fb 100%)',
              border: '1.5px solid rgba(45,40,32,0.18)',
              boxShadow: '0 4px 24px rgba(196,77,106,0.1), 0 1px 4px rgba(45,40,32,0.05)',
            }}
          >
            <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" width={38} height={38}>
              <circle cx="10" cy="28" r="4" fill="#e8778f" opacity="0.8" />
              <circle cx="19" cy="18" r="4" fill="#9b89d4" opacity="0.8" />
              <circle cx="28" cy="10" r="4" fill="#6fa896" opacity="0.8" />
              <line x1="10" y1="28" x2="19" y2="18" stroke="#c44d6a" strokeWidth="1.5" strokeDasharray="3,2" />
              <line x1="19" y1="18" x2="28" y2="10" stroke="#6fa896" strokeWidth="1.5" strokeDasharray="3,2" />
              <rect x="4" y="4" width="8" height="6" rx="2" fill="#f4a8b8" opacity="0.5" />
              <rect x="26" y="24" width="8" height="6" rx="2" fill="#a8c5b8" opacity="0.5" />
            </svg>
          </motion.div>

          <h1
            className="text-center leading-tight tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#2d2820', letterSpacing: '-0.02em', lineHeight: 1.15 }}
          >
            EDA <em style={{ color: '#c44d6a', fontStyle: 'italic' }}>Studio</em>
          </h1>
          <p className="text-center mt-3 font-light max-w-sm leading-relaxed" style={{ color: '#6b6258', fontSize: '1.05rem' }}>
            Drop any dataset. Get a beautiful analysis dashboard with hidden pattern detection and exportable notebook code.
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div variants={item} className="w-full">
          <motion.div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            animate={dragging ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative rounded-[20px] cursor-pointer transition-all duration-250"
            style={{
              border: `2px dashed ${dragging ? '#c44d6a' : '#e8778f'}`,
              background: dragging ? '#fdf0f3' : '#ffffff',
              padding: '3rem 2rem',
              boxShadow: dragging
                ? '0 0 40px rgba(196,77,106,0.12), 0 4px 24px rgba(45,40,32,0.08)'
                : '0 2px 16px rgba(45,40,32,0.06)',
            }}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.tsv,.json"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
            />

            <motion.div
              animate={{ y: dragging ? -4 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: dragging ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-5xl mb-3 select-none"
              >
                🌸
              </motion.div>
              <div className="font-medium mb-1" style={{ color: '#2d2820', fontSize: '1.05rem' }}>
                Drop your dataset here
              </div>
              <div style={{ color: '#6b6258', fontSize: '0.875rem' }}>
                or{' '}
                <span
                  className="font-medium cursor-pointer"
                  style={{ color: '#c44d6a' }}
                  onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                >
                  browse files
                </span>
              </div>
            </motion.div>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-center"
              style={{ color: '#c44d6a' }}
            >
              {error}
            </motion.p>
          )}

          {/* Format badges */}
          <div className="flex gap-2 justify-center flex-wrap mt-4">
            {['CSV', 'TSV', 'JSON'].map(fmt => (
              <span
                key={fmt}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: '#faf5ed', color: '#8a6540', border: '1px solid #e8d5b7' }}
              >
                {fmt}
              </span>
            ))}
          </div>

          {/* Sample dataset button */}
          <div className="mt-4 text-center">
            <motion.button
              whileHover={{ scale: 1.02, borderColor: '#6fa896', color: '#3d7a6b' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSample}
              className="rounded-full px-5 py-2 text-sm transition-colors duration-200"
              style={{
                background: 'none',
                border: '1.5px solid rgba(45,40,32,0.18)',
                color: '#6b6258',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              ✦ Try with sample dataset
            </motion.button>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div variants={item} className="flex gap-3 flex-wrap justify-center mt-8 max-w-lg">
          {FEATURE_PILLS.map((pill, i) => (
            <motion.div
              key={pill.label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.07, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.04, y: -1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(45,40,32,0.10)',
                color: '#6b6258',
                boxShadow: '0 1px 4px rgba(45,40,32,0.04)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: pill.color }}
              />
              {pill.label}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
