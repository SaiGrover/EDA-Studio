'use client';

import { motion } from 'framer-motion';
import type { AnalysisResult } from '@/types/analysis';
import { buildJupyterNotebook } from '@/lib/notebook';

interface Props {
  fileName: string;
  onReset: () => void;
  analysis: AnalysisResult;
}

export default function TopBar({ fileName, onReset, analysis }: Props) {
  function downloadNotebook() {
    const nb = buildJupyterNotebook(analysis, fileName);
    const blob = new Blob([JSON.stringify(nb, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `eda_${fileName}.ipynb`;
    a.click();
  }

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(250,247,242,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(45,40,32,0.10)',
        boxShadow: '0 1px 12px rgba(45,40,32,0.06)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: '#e8778f' }}
          />
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '1.2rem',
              color: '#2d2820',
            }}
          >
            EDA Studio
          </span>
        </div>

        {/* File badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: '#fdf0f3',
            border: '1px solid #f4a8b8',
            color: '#c44d6a',
          }}
        >
          <span>📊</span>
          <span>{fileName}.csv</span>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReset}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-200"
            style={{
              background: 'none',
              border: '1.5px solid rgba(45,40,32,0.18)',
              color: '#6b6258',
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#6fa896';
              (e.currentTarget as HTMLButtonElement).style.color = '#3d7a6b';
              (e.currentTarget as HTMLButtonElement).style.background = '#eef5f2';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(45,40,32,0.18)';
              (e.currentTarget as HTMLButtonElement).style.color = '#6b6258';
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            ← New dataset
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(196,77,106,0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={downloadNotebook}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #c44d6a 0%, #e8778f 100%)',
              border: 'none',
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(196,77,106,0.2)',
            }}
          >
            ⬇ Export notebook
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
