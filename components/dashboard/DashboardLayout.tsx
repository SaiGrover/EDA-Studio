'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult, DataRow } from '@/types/analysis';
import TopBar from './TopBar';
import OverviewGrid from './OverviewGrid';
import InsightsBar from './InsightsBar';
import DistributionsTab from './DistributionsTab';
import CorrelationsTab from './CorrelationsTab';
import StatisticsTab from './StatisticsTab';
import RawDataTab from './RawDataTab';
import NotebookTab from './NotebookTab';

interface Props {
  analysis: AnalysisResult;
  rows: DataRow[];
  fileName: string;
  onReset: () => void;
}

type Tab = 'distributions' | 'correlations' | 'statistics' | 'data' | 'notebook';

const TABS: { id: Tab; label: string }[] = [
  { id: 'distributions', label: 'Distributions' },
  { id: 'correlations', label: 'Correlations' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'data', label: 'Raw data' },
  { id: 'notebook', label: 'Notebook' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 28 } },
};

export default function DashboardLayout({ analysis, rows, fileName, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('distributions');

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
      style={{ background: '#faf7f2' }}
    >
      <TopBar fileName={fileName} onReset={onReset} analysis={analysis} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-6 py-8 max-w-[1400px] mx-auto"
      >
        {/* Overview */}
        <motion.section variants={sectionVariants}>
          <SectionTitle>Dataset overview</SectionTitle>
          <OverviewGrid analysis={analysis} />
        </motion.section>

        {/* Insights */}
        <motion.section variants={sectionVariants} className="mt-8">
          <SectionTitle>Detected patterns &amp; insights</SectionTitle>
          <InsightsBar patterns={analysis.patterns} />
        </motion.section>

        {/* Tabs */}
        <motion.section variants={sectionVariants} className="mt-8">
          {/* Tab row */}
          <div
            className="inline-flex gap-1 rounded-xl p-1 mb-6"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(45,40,32,0.10)',
              boxShadow: '0 1px 4px rgba(45,40,32,0.04)',
            }}
          >
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2"
                style={{
                  color: activeTab === tab.id ? '#c44d6a' : '#6b6258',
                  fontFamily: "'DM Sans', sans-serif",
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: '#fdf0f3' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'distributions' && (
              <DistributionsTab analysis={analysis} rows={rows} />
            )}
            {activeTab === 'correlations' && (
              <CorrelationsTab analysis={analysis} />
            )}
            {activeTab === 'statistics' && (
              <StatisticsTab analysis={analysis} />
            )}
            {activeTab === 'data' && (
              <RawDataTab rows={rows} cols={analysis.cols} />
            )}
            {activeTab === 'notebook' && (
              <NotebookTab analysis={analysis} fileName={fileName} />
            )}
          </motion.div>
        </motion.section>
      </motion.div>
    </motion.div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '1.25rem',
          color: '#2d2820',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </h2>
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(to right, rgba(45,40,32,0.12), transparent)' }}
      />
    </div>
  );
}
