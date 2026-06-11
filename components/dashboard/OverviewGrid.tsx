'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult } from '@/types/analysis';

interface Props {
  analysis: AnalysisResult;
}

const ACCENTS = ['#f4a8b8', '#c5b8e8', '#a8c5b8', '#f4c5a8', '#b8d4e8', '#e8d5b7'];

export default function OverviewGrid({ analysis }: Props) {
  const { n, cols, numCols, catCols, colInfo, patterns } = analysis;
  const totalMissing = Object.values(colInfo).reduce((s, c) => s + c.nullCount, 0);
  const missRate = ((totalMissing / (n * cols.length)) * 100).toFixed(1);

  const items = [
    { label: 'Rows', value: n.toLocaleString(), sub: 'observations' },
    { label: 'Columns', value: cols.length, sub: 'features' },
    { label: 'Numeric', value: numCols.length, sub: 'quantitative cols' },
    { label: 'Categorical', value: catCols.length, sub: 'qualitative cols' },
    { label: 'Missing %', value: `${missRate}%`, sub: 'of all values' },
    { label: 'Patterns', value: patterns.length, sub: 'detected insights' },
  ];

  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))' }}>
      {items.map((item, i) => (
        <OverviewCard key={item.label} item={item} accent={ACCENTS[i]} index={i} />
      ))}
    </div>
  );
}

function OverviewCard({
  item,
  accent,
  index,
}: {
  item: { label: string; value: string | number; sub: string };
  accent: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.06,
        type: 'spring',
        stiffness: 280,
        damping: 28,
      }}
      whileHover={{
        y: -3,
        boxShadow: '0 8px 32px rgba(45,40,32,0.12), 0 2px 8px rgba(45,40,32,0.06)',
      }}
      className="rounded-2xl p-5 cursor-default"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(45,40,32,0.10)',
        boxShadow: '0 2px 16px rgba(45,40,32,0.07), 0 1px 4px rgba(45,40,32,0.05)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Accent bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 32 }}
        transition={{ delay: index * 0.06 + 0.3, duration: 0.5, ease: 'easeOut' }}
        className="h-1 rounded-full mb-3"
        style={{ background: accent }}
      />

      <div
        className="text-xs font-medium uppercase tracking-widest mb-1"
        style={{ color: '#a09890', letterSpacing: '0.06em' }}
      >
        {item.label}
      </div>

      <AnimatedValue value={item.value} accent={accent} />

      <div className="text-xs mt-1" style={{ color: '#6b6258' }}>
        {item.sub}
      </div>
    </motion.div>
  );
}

function AnimatedValue({ value, accent }: { value: string | number; accent: string }) {
  const isNumeric = typeof value === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
      style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '2rem',
        color: '#2d2820',
        lineHeight: 1,
      }}
    >
      {isNumeric ? (
        <CountUp target={value as number} />
      ) : (
        <span>{value}</span>
      )}
    </motion.div>
  );
}

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (t < 1) frame.current = requestAnimationFrame(animate);
    };
    frame.current = requestAnimationFrame(animate);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  }, [target]);

  return <span ref={ref}>0</span>;
}
