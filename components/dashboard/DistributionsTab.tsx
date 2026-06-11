'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult, DataRow } from '@/types/analysis';
import { makeBins } from '@/lib/analysis';
import { CHART_PALETTE, CHART_PALETTE_ALPHA } from '@/lib/utils';

interface Props {
  analysis: AnalysisResult;
  rows: DataRow[];
}

const CHART_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
  gap: '16px',
};

export default function DistributionsTab({ analysis, rows }: Props) {
  return (
    <div style={CHART_GRID}>
      {/* Numeric histograms */}
      {analysis.numCols.slice(0, 6).map((col, i) => {
        const info = analysis.colInfo[col];
        if (info.type !== 'numeric') return null;
        const bins = makeBins(info.nonNull, 20);
        return (
          <ChartCard
            key={col}
            title={col}
            desc={`Mean: ${info.mean.toFixed(2)} | Std: ${info.std.toFixed(2)} | Skew: ${info.skewness.toFixed(2)}`}
            index={i}
          >
            <PlotlyHistogram
              labels={bins.map(b => b.label)}
              values={bins.map(b => b.count)}
              color={CHART_PALETTE[i % CHART_PALETTE.length]}
            />
          </ChartCard>
        );
      })}

      {/* Categorical bar charts */}
      {analysis.catCols.slice(0, 4).map((col, i) => {
        const info = analysis.colInfo[col];
        if (info.type !== 'categorical') return null;
        const top = info.topValues.slice(0, 8);
        return (
          <ChartCard
            key={col}
            title={col}
            desc={`${info.unique} unique values`}
            index={analysis.numCols.length + i}
          >
            <PlotlyBarH
              labels={top.map(v => (v[0].length > 14 ? v[0].slice(0, 12) + '…' : v[0]))}
              values={top.map(v => v[1])}
              color={CHART_PALETTE_ALPHA[(i + 2) % CHART_PALETTE_ALPHA.length]}
              borderColor={CHART_PALETTE[(i + 2) % CHART_PALETTE.length]}
            />
          </ChartCard>
        );
      })}

      {/* Scatter if ≥2 num cols */}
      {analysis.numCols.length >= 2 && (() => {
        const [cx, cy] = analysis.numCols.slice(0, 2);
        const sampleRows = rows.filter((_, i) => i % Math.ceil(rows.length / 400) === 0);
        return (
          <ChartCard
            key="scatter"
            title={`${cx} vs ${cy}`}
            desc="Relationship between two numeric features"
            tall
            index={analysis.numCols.length + analysis.catCols.length}
          >
            <PlotlyScatter
              x={sampleRows.map(r => +(r[cx] as number))}
              y={sampleRows.map(r => +(r[cy] as number))}
              xLabel={cx}
              yLabel={cy}
            />
          </ChartCard>
        );
      })()}
    </div>
  );
}

function ChartCard({
  title,
  desc,
  children,
  tall,
  index,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  tall?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 28 }}
      whileHover={{ boxShadow: '0 8px 32px rgba(45,40,32,0.11)', y: -2 }}
      className="rounded-[18px] p-6"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(45,40,32,0.10)',
        boxShadow: '0 2px 16px rgba(45,40,32,0.07), 0 1px 4px rgba(45,40,32,0.05)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      <div className="mb-3">
        <div className="font-medium" style={{ fontSize: '0.92rem', color: '#2d2820' }}>
          {title}
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#a09890' }}>
          {desc}
        </div>
      </div>
      <div style={{ height: tall ? '280px' : '220px' }}>{children}</div>
    </motion.div>
  );
}

/* ── Plotly wrappers ─────────────────────────────────── */

function PlotlyHistogram({
  labels,
  values,
  color,
}: {
  labels: string[];
  values: number[];
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let Plotly: typeof import('plotly.js');
    import('plotly.js').then(mod => {
      Plotly = mod.default as typeof import('plotly.js');
      if (!ref.current) return;
      Plotly.newPlot(
        ref.current,
        [
          {
            x: labels,
            y: values,
            type: 'bar',
            marker: {
              color: color + 'aa',
              line: { color, width: 1 },
            },
          } as import('plotly.js').Data,
        ],
        {
          margin: { t: 8, r: 8, b: 40, l: 40 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'DM Sans', color: '#a09890', size: 10 },
          xaxis: {
            showgrid: false,
            tickfont: { size: 10, color: '#a09890' },
            nticks: 8,
          },
          yaxis: {
            gridcolor: 'rgba(45,40,32,0.05)',
            tickfont: { size: 10, color: '#a09890' },
          },
          bargap: 0.05,
        },
        { responsive: true, displayModeBar: false }
      );
    });

    return () => {
      import('plotly.js').then(mod => {
        if (ref.current) (mod.default as typeof import('plotly.js')).purge(ref.current);
      });
    };
  }, [labels, values, color]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}

function PlotlyBarH({
  labels,
  values,
  color,
  borderColor,
}: {
  labels: string[];
  values: number[];
  color: string;
  borderColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import('plotly.js').then(mod => {
      const Plotly = mod.default as typeof import('plotly.js');
      if (!ref.current) return;
      Plotly.newPlot(
        ref.current,
        [
          {
            x: values,
            y: labels,
            type: 'bar',
            orientation: 'h',
            marker: { color, line: { color: borderColor, width: 1 } },
          } as import('plotly.js').Data,
        ],
        {
          margin: { t: 8, r: 8, b: 32, l: 80 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'DM Sans', color: '#a09890', size: 10 },
          xaxis: {
            gridcolor: 'rgba(45,40,32,0.05)',
            tickfont: { size: 10, color: '#a09890' },
          },
          yaxis: {
            showgrid: false,
            tickfont: { size: 10, color: '#a09890' },
          },
          bargap: 0.15,
        },
        { responsive: true, displayModeBar: false }
      );
    });

    return () => {
      import('plotly.js').then(mod => {
        if (ref.current) (mod.default as typeof import('plotly.js')).purge(ref.current);
      });
    };
  }, [labels, values, color, borderColor]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}

function PlotlyScatter({
  x,
  y,
  xLabel,
  yLabel,
}: {
  x: number[];
  y: number[];
  xLabel: string;
  yLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import('plotly.js').then(mod => {
      const Plotly = mod.default as typeof import('plotly.js');
      if (!ref.current) return;
      Plotly.newPlot(
        ref.current,
        [
          {
            x,
            y,
            type: 'scatter',
            mode: 'markers',
            marker: {
              color: 'rgba(155,137,212,0.5)',
              size: 5,
              line: { color: '#9b89d4', width: 0.5 },
            },
          } as import('plotly.js').Data,
        ],
        {
          margin: { t: 8, r: 8, b: 44, l: 50 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'DM Sans', color: '#a09890', size: 10 },
          xaxis: {
            title: { text: xLabel, font: { size: 10 } },
            gridcolor: 'rgba(45,40,32,0.05)',
            tickfont: { size: 10, color: '#a09890' },
          },
          yaxis: {
            title: { text: yLabel, font: { size: 10 } },
            gridcolor: 'rgba(45,40,32,0.05)',
            tickfont: { size: 10, color: '#a09890' },
          },
        },
        { responsive: true, displayModeBar: false }
      );
    });

    return () => {
      import('plotly.js').then(mod => {
        if (ref.current) (mod.default as typeof import('plotly.js')).purge(ref.current);
      });
    };
  }, [x, y, xLabel, yLabel]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}
