'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingPage from '@/components/landing/LandingPage';
import LoadingScreen from '@/components/dashboard/LoadingScreen';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { AnalysisResult, DataRow } from '@/types/analysis';

type AppState = 'landing' | 'loading' | 'dashboard';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [rows, setRows] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState('dataset');

  function handleDataReady(data: DataRow[], cols: string[], name: string) {
    setFileName(name);
    setAppState('loading');

    // Defer heavy analysis after loading animation starts
    setTimeout(() => {
      import('@/lib/analysis').then(({ analyseData }) => {
        const result = analyseData(data, cols);
        setRows(data);
        setAnalysis(result);
        setAppState('dashboard');
      });
    }, 2600);
  }

  function handleReset() {
    setAppState('landing');
    setAnalysis(null);
    setRows([]);
    setFileName('dataset');
  }

  return (
    <AnimatePresence mode="wait">
      {appState === 'landing' && (
        <LandingPage key="landing" onDataReady={handleDataReady} />
      )}
      {appState === 'loading' && (
        <LoadingScreen key="loading" />
      )}
      {appState === 'dashboard' && analysis && (
        <DashboardLayout
          key="dashboard"
          analysis={analysis}
          rows={rows}
          fileName={fileName}
          onReset={handleReset}
        />
      )}
    </AnimatePresence>
  );
}
