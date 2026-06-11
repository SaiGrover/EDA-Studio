'use client';

import { motion } from 'framer-motion';
import type { DataPattern } from '@/types/analysis';
import { COLOR_MAP } from '@/lib/utils';

interface Props {
  patterns: DataPattern[];
}

export default function InsightsBar({ patterns }: Props) {
  return (
    <div className="insights-bar-scroll">
      {patterns.map((pattern, i) => {
        const [tc, bg] = COLOR_MAP[pattern.color] ?? ['#2d2820', '#faf7f2'];
        return (
          <InsightCard key={i} pattern={pattern} tc={tc} bg={bg} index={i} />
        );
      })}
    </div>
  );
}

function InsightCard({
  pattern,
  tc,
  bg,
  index,
}: {
  pattern: DataPattern;
  tc: string;
  bg: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300, damping: 28 }}
      whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(45,40,32,0.12)' }}
      className="flex-shrink-0 rounded-xl p-4 cursor-default"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(45,40,32,0.10)',
        borderTop: `3px solid ${tc}`,
        boxShadow: '0 2px 12px rgba(45,40,32,0.06)',
        minWidth: '220px',
        maxWidth: '260px',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wider mb-1"
        style={{ color: tc, letterSpacing: '0.07em' }}
      >
        {pattern.icon} {pattern.tag}
      </div>
      <div className="font-medium mb-1.5" style={{ fontSize: '0.85rem', color: '#2d2820' }}>
        {pattern.title}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#6b6258', lineHeight: 1.55 }}>
        {pattern.desc}
      </p>
    </motion.div>
  );
}
