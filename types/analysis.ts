export interface NumericColumnInfo {
  type: 'numeric';
  nullCount: number;
  nullPct: number;
  nonNull: number[];
  min: number;
  max: number;
  mean: number;
  std: number;
  median: number;
  q1: number;
  q3: number;
  iqr: number;
  outliers: number[];
  skewness: number;
  unique: number;
}

export interface CategoricalColumnInfo {
  type: 'categorical';
  nullCount: number;
  nullPct: number;
  freq: Record<string, number>;
  topValues: [string, number][];
  unique: number;
}

export type ColumnInfo = NumericColumnInfo | CategoricalColumnInfo;

export interface DataPattern {
  icon: string;
  type: string;
  color: 'rose' | 'lavender' | 'sage' | 'peach' | 'sky' | 'sand';
  title: string;
  desc: string;
  tag: string;
}

export interface AnalysisResult {
  n: number;
  cols: string[];
  numCols: string[];
  catCols: string[];
  colInfo: Record<string, ColumnInfo>;
  corrMatrix: Record<string, Record<string, number>>;
  patterns: DataPattern[];
}

export type DataRow = Record<string, string | number | boolean | null>;

export interface OverviewItem {
  label: string;
  value: string | number;
  sub: string;
  accent: string;
}

export type ChartType = 'histogram' | 'bar' | 'scatter' | 'pie';

export interface BinData {
  label: string;
  count: number;
}
