import type {
  AnalysisResult,
  ColumnInfo,
  DataPattern,
  DataRow,
  BinData,
} from '@/types/analysis';

export function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function calcSkewness(nums: number[], mean: number, std: number): number {
  if (std === 0) return 0;
  const n = nums.length;
  return nums.reduce((a, v) => a + ((v - mean) / std) ** 3, 0) / n;
}

export function pearsonCorr(a: number[], b: number[]): number {
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

export function detectPatterns(
  colInfo: Record<string, ColumnInfo>,
  numCols: string[],
  catCols: string[],
  rows: DataRow[],
  corrMatrix: Record<string, Record<string, number>>,
  n: number
): DataPattern[] {
  const patterns: DataPattern[] = [];

  // High correlations
  numCols.forEach(c1 =>
    numCols.forEach(c2 => {
      if (c1 >= c2) return;
      const r = corrMatrix[c1]?.[c2] ?? 0;
      if (Math.abs(r) > 0.75) {
        patterns.push({
          icon: '🔗',
          type: 'correlation',
          color: 'rose',
          title: `Strong ${r > 0 ? 'positive' : 'negative'} correlation`,
          desc: `${c1} & ${c2} are ${Math.abs(r) > 0.9 ? 'very strongly' : 'strongly'} correlated (r = ${r.toFixed(2)}).`,
          tag: Math.abs(r) > 0.9 ? 'Very strong' : 'Strong',
        });
      }
    })
  );

  // Skewed distributions
  numCols.forEach(col => {
    const info = colInfo[col];
    if (info.type === 'numeric' && Math.abs(info.skewness) > 1.5) {
      patterns.push({
        icon: '📐',
        type: 'skewness',
        color: 'lavender',
        title: `${info.skewness > 0 ? 'Right' : 'Left'}-skewed: ${col}`,
        desc: `${col} shows significant ${info.skewness > 0 ? 'positive' : 'negative'} skewness (${info.skewness.toFixed(2)}). Consider log transformation.`,
        tag: 'Distribution',
      });
    }
  });

  // Outliers
  numCols.forEach(col => {
    const info = colInfo[col];
    if (info.type === 'numeric') {
      const outlierPct = (info.outliers.length / info.nonNull.length) * 100;
      if (outlierPct > 3) {
        patterns.push({
          icon: '⚡',
          type: 'outlier',
          color: 'peach',
          title: `Outliers in ${col}`,
          desc: `${info.outliers.length} outliers detected (${outlierPct.toFixed(1)}% of values). Range: [${info.min.toFixed(2)}, ${info.max.toFixed(2)}].`,
          tag: 'Outliers',
        });
      }
    }
  });

  // High nulls
  Object.entries(colInfo).forEach(([col, info]) => {
    if (info.nullPct > 15) {
      patterns.push({
        icon: '🕳️',
        type: 'missing',
        color: 'sage',
        title: `High missingness: ${col}`,
        desc: `${col} has ${info.nullPct.toFixed(1)}% missing values. Consider imputation or dropping.`,
        tag: 'Data quality',
      });
    }
  });

  // High cardinality
  catCols.forEach(col => {
    const info = colInfo[col];
    if (info.type === 'categorical' && info.unique > n * 0.8 && info.unique > 20) {
      patterns.push({
        icon: '🆔',
        type: 'identifier',
        color: 'sky',
        title: `Possible ID column: ${col}`,
        desc: `${col} has ${info.unique} unique values (${((info.unique / n) * 100).toFixed(0)}% of rows). Likely an identifier.`,
        tag: 'Feature type',
      });
    }
  });

  // Dominant category
  catCols.forEach(col => {
    const info = colInfo[col];
    if (info.type === 'categorical' && info.topValues.length > 0) {
      const topPct = (info.topValues[0][1] / n) * 100;
      if (topPct > 70) {
        patterns.push({
          icon: '🎯',
          type: 'imbalance',
          color: 'sand',
          title: `Imbalanced: ${col}`,
          desc: `"${info.topValues[0][0]}" makes up ${topPct.toFixed(1)}% of values in ${col}. Class imbalance detected.`,
          tag: 'Imbalance',
        });
      }
    }
  });

  // Zero variance
  numCols.forEach(col => {
    const info = colInfo[col];
    if (info.type === 'numeric' && info.std < 0.0001) {
      patterns.push({
        icon: '📌',
        type: 'constant',
        color: 'sage',
        title: `Near-constant: ${col}`,
        desc: `${col} has almost no variance (std ≈ 0). This feature adds little predictive value.`,
        tag: 'Low variance',
      });
    }
  });

  if (patterns.length === 0) {
    patterns.push({
      icon: '✅',
      type: 'clean',
      color: 'sage',
      title: 'Dataset looks clean',
      desc: 'No major issues detected. Data distributions appear healthy with minimal missingness.',
      tag: 'Healthy',
    });
  }

  return patterns.slice(0, 8);
}

export function analyseData(rows: DataRow[], cols: string[]): AnalysisResult {
  const n = rows.length;
  const colInfo: Record<string, ColumnInfo> = {};
  const numCols: string[] = [];
  const catCols: string[] = [];

  cols.forEach(col => {
    const vals = rows.map(r => r[col]);
    const nonNull = vals.filter(v => v !== null && v !== undefined && v !== '');
    const nullCount = n - nonNull.length;
    const isNumeric =
      nonNull.length > 0 && nonNull.every(v => !isNaN(+(v as string)) && v !== '');

    if (isNumeric) {
      const nums = nonNull.map(v => +(v as string)).sort((a, b) => a - b);
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
      const std = Math.sqrt(variance);
      const q1 = percentile(nums, 25);
      const median = percentile(nums, 50);
      const q3 = percentile(nums, 75);
      const iqr = q3 - q1;
      const outliers = nums.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
      const skewness = calcSkewness(nums, mean, std);
      colInfo[col] = {
        type: 'numeric',
        nullCount,
        nullPct: (nullCount / n) * 100,
        nonNull: nums,
        min: nums[0],
        max: nums[nums.length - 1],
        mean,
        std,
        median,
        q1,
        q3,
        iqr,
        outliers,
        skewness,
        unique: new Set(nums).size,
      };
      numCols.push(col);
    } else {
      const freq: Record<string, number> = {};
      nonNull.forEach(v => {
        const k = String(v);
        freq[k] = (freq[k] || 0) + 1;
      });
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      colInfo[col] = {
        type: 'categorical',
        nullCount,
        nullPct: (nullCount / n) * 100,
        freq,
        topValues: sorted.slice(0, 10),
        unique: Object.keys(freq).length,
      };
      catCols.push(col);
    }
  });

  const corrMatrix: Record<string, Record<string, number>> = {};
  numCols.forEach(c1 => {
    corrMatrix[c1] = {};
    numCols.forEach(c2 => {
      corrMatrix[c1][c2] = pearsonCorr(
        rows.map(r => +(r[c1] as string)),
        rows.map(r => +(r[c2] as string))
      );
    });
  });

  const patterns = detectPatterns(colInfo, numCols, catCols, rows, corrMatrix, n);

  return { n, cols, numCols, catCols, colInfo, corrMatrix, patterns };
}

export function makeBins(data: number[], numBins: number): BinData[] {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const step = (max - min) / numBins || 1;
  const bins: BinData[] = Array.from({ length: numBins }, (_, i) => ({
    label: (min + i * step).toFixed(1),
    count: 0,
  }));
  data.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / step), numBins - 1);
    bins[idx].count++;
  });
  return bins;
}

export function generateSampleData(): DataRow[] {
  const rng = (a: number, b: number, dec = 0) => {
    const v = a + Math.random() * (b - a);
    return dec ? +v.toFixed(dec) : Math.round(v);
  };
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const categories = ['Electronics', 'Clothing', 'Food', 'Sports', 'Books'];

  return Array.from({ length: 800 }, (_, i) => {
    const age = rng(18, 75);
    const income = rng(20000, 120000);
    const region = regions[Math.floor(Math.random() * 5)];
    const category = categories[Math.floor(Math.random() * 5)];
    const spend = Math.round(income * rng(0.02, 0.15, 2) * (age > 40 ? 1.2 : 0.9));
    const satisfaction = rng(1, 5);
    return {
      customer_id: 1000 + i,
      age,
      income,
      region,
      category,
      annual_spend: spend,
      num_purchases: rng(1, 50),
      satisfaction,
      loyalty_score: +(satisfaction * rng(0.8, 1.2, 2)).toFixed(1),
      days_since_last_purchase: rng(1, 365),
      email_opens: rng(0, 100),
      churn_risk:
        age > 60 && satisfaction < 3 ? 'High' : satisfaction > 3 ? 'Low' : 'Medium',
      is_premium: income > 80000,
    };
  });
}
