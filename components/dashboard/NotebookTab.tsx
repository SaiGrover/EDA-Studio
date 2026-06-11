'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult } from '@/types/analysis';
import { getFullNotebookCode, buildJupyterNotebook } from '@/lib/notebook';

interface Props {
  analysis: AnalysisResult;
  fileName: string;
}

const SECTION_LABELS = [
  'Imports & setup',
  'Load dataset',
  'Overview',
  'Missing values',
  'Descriptive stats',
  'Distributions',
  'Correlations',
  'Outliers',
  'Patterns',
  'Pairplot',
];

export default function NotebookTab({ analysis, fileName }: Props) {
  const [copied, setCopied] = useState(false);

  const code = getFullNotebookCode(analysis, fileName);
  const sections = code.split(/\n# ─+\n\n/);

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadNb() {
    const nb = buildJupyterNotebook(analysis, fileName);
    const blob = new Blob([JSON.stringify(nb, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `eda_${fileName}.ipynb`;
    a.click();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="rounded-[18px] overflow-hidden"
      style={{ background: '#1e1d1a', boxShadow: '0 4px 24px rgba(45,40,32,0.12)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: '#2a2926',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.82rem', color: '#a09080' }}
        >
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          📓 eda_analysis.ipynb — Python / Jupyter
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={copyCode}
            className="px-3 py-1 rounded-lg text-xs transition-all"
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              color: copied ? '#a8c5b8' : '#a09080',
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
            }}
          >
            {copied ? '✓ Copied!' : 'Copy all code'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={downloadNb}
            className="px-3 py-1 rounded-lg text-xs transition-all"
            style={{
              background: 'rgba(196,77,106,0.2)',
              border: '1px solid rgba(196,77,106,0.3)',
              color: '#f4a8b8',
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
            }}
          >
            ⬇ .ipynb
          </motion.button>
        </div>
      </div>

      {/* Notebook body */}
      <div style={{ padding: '1.5rem', maxHeight: '680px', overflowY: 'auto' }}>
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="mb-6"
          >
            {/* Cell header */}
            <div
              className="mb-2 flex items-center gap-2"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#6b6258' }}
            >
              <span>In [{i + 1}]:</span>
              {SECTION_LABELS[i] && (
                <span
                  className="px-2 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#8a7a70', fontSize: '0.65rem' }}
                >
                  {SECTION_LABELS[i]}
                </span>
              )}
            </div>

            {/* Cell body */}
            <div
              className="rounded-lg p-4 overflow-x-auto"
              style={{
                background: '#252422',
                borderLeft: `3px solid ${i % 2 === 0 ? '#e8778f' : '#a8c5b8'}`,
              }}
            >
              <pre className="nb-pre">
                <SyntaxHighlight code={section.trim()} />
              </pre>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function SyntaxHighlight({ code }: { code: string }) {
  // Simple regex-based highlighting
  const parts: React.ReactNode[] = [];
  let remaining = code;
  let key = 0;

  const patterns: Array<[RegExp, string]> = [
    [/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, 'str'],
    [/(#[^\n]*)/g, 'cm'],
    [/\b(import|from|def|class|return|if|else|elif|for|while|in|not|and|or|True|False|None|as|with|try|except|finally|lambda|yield|async|await)\b/g, 'kw'],
    [/\b(print|len|range|enumerate|zip|map|filter|sorted|list|dict|set|tuple|str|int|float|bool|pd|np|plt|sns|df|fig|ax|axes)\b/g, 'fn'],
    [/\b(\d+\.?\d*)\b/g, 'num'],
  ];

  // Fall back to simple rendering without highlighting complexity
  return (
    <code style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', color: '#e8d5b7', lineHeight: 1.7 }}>
      {code.split('\n').map((line, i) => (
        <span key={i}>
          <HighlightLine line={line} />
          {'\n'}
        </span>
      ))}
    </code>
  );
}

function HighlightLine({ line }: { line: string }) {
  // Comment
  if (line.trim().startsWith('#')) {
    return <span style={{ color: '#6b6258', fontStyle: 'italic' }}>{line}</span>;
  }

  // Simple tokenizer
  const tokens = line.split(
    /(\"[^\"]*\"|\'[^\']*\'|\b(?:import|from|def|class|return|if|else|elif|for|while|in|not|and|or|True|False|None|as|with|try|except)\b|\b\d+\.?\d*\b)/
  );

  return (
    <>
      {tokens.map((tok, i) => {
        if (/^["']/.test(tok)) return <span key={i} style={{ color: '#f4c5a8' }}>{tok}</span>;
        if (/^\b(import|from|def|class|return|if|else|elif|for|while|in|not|and|or|True|False|None|as|with|try|except)\b$/.test(tok))
          return <span key={i} style={{ color: '#c5b8e8' }}>{tok}</span>;
        if (/^\d/.test(tok)) return <span key={i} style={{ color: '#f4a8b8' }}>{tok}</span>;
        return <span key={i}>{tok}</span>;
      })}
    </>
  );
}
