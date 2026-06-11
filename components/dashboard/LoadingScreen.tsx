'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  'Parsing dataset structure',
  'Computing statistics',
  'Detecting hidden patterns',
  'Building visualisations',
  'Generating notebook code',
];

export default function LoadingScreen() {
  const [activeSteps, setActiveSteps] = useState<number[]>([]);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => {
        setActiveSteps(prev => [...prev, i]);
      }, 380 + i * 200)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Ambient bg */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,168,184,0.15) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Spinner */}
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full"
            style={{
              border: '3px solid #fdf0f3',
              borderTopColor: '#c44d6a',
            }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full"
            style={{
              border: '2px solid #f3f0fb',
              borderTopColor: '#9b89d4',
            }}
          />
          {/* Center dot */}
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#c44d6a' }} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-1"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#2d2820' }}
        >
          Analysing your data
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm mb-8"
          style={{ color: '#6b6258' }}
        >
          Looking for patterns &amp; insights…
        </motion.p>

        {/* Steps */}
        <div className="flex flex-col gap-3 w-64">
          {STEPS.map((step, i) => (
            <AnimatePresence key={step}>
              {activeSteps.includes(i) && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold"
                    style={{
                      background: '#eef5f2',
                      border: '1.5px solid #6fa896',
                      color: '#3d7a6b',
                    }}
                  >
                    ✓
                  </motion.div>
                  <span className="text-sm" style={{ color: '#3d7a6b' }}>
                    {step}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Progress bar */}
        <div
          className="mt-8 w-64 h-1.5 rounded-full overflow-hidden"
          style={{ background: '#fdf0f3' }}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${(activeSteps.length / STEPS.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 25 }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #e8778f, #c44d6a)' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
