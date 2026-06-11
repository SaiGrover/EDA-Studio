import type { AnalysisResult } from '@/types/analysis';

export function buildImportsCode() {
  return `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# Configure plots
plt.rcParams['figure.figsize'] = (12, 5)
plt.rcParams['axes.spines.top'] = False
plt.rcParams['axes.spines.right'] = False
sns.set_palette(['#e8778f','#9b89d4','#6fa896','#d4894a','#6a9fc4'])
plt.style.use('seaborn-v0_8-whitegrid')`;
}

export function buildLoadCode(fileName: string) {
  return `# Load dataset
df = pd.read_csv('${fileName}.csv')
print(f"Shape: {df.shape}")
print(f"\\nFirst 5 rows:")
df.head()`;
}

export function buildOverviewCode() {
  return `# Dataset overview
print("=== DATASET OVERVIEW ===")
print(f"Rows: {len(df):,}")
print(f"Columns: {len(df.columns)}")
print(f"\\nColumn types:")
print(df.dtypes)
print(f"\\nMemory usage: {df.memory_usage(deep=True).sum() / 1024:.1f} KB")
print(f"\\nMissing values:")
missing = df.isnull().sum()
print(missing[missing > 0])`;
}

export function buildMissingCode() {
  return `# Missing value analysis
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Heatmap
sns.heatmap(df.isnull(), ax=axes[0], cbar=False, yticklabels=False,
            cmap=['#eef5f2', '#e8778f'])
axes[0].set_title('Missing Value Heatmap', fontsize=13)

# Bar chart
missing_pct = df.isnull().mean() * 100
missing_pct = missing_pct[missing_pct > 0].sort_values(ascending=False)
if len(missing_pct) > 0:
    missing_pct.plot(kind='bar', ax=axes[1], color='#e8778f', edgecolor='white')
    axes[1].set_title('Missing % by Column', fontsize=13)
    axes[1].set_ylabel('Missing %')
    plt.xticks(rotation=45, ha='right')
else:
    axes[1].text(0.5, 0.5, 'No missing values!', ha='center', va='center',
                 transform=axes[1].transAxes, fontsize=14, color='#3d7a6b')
    axes[1].set_title('Missing % by Column', fontsize=13)

plt.tight_layout()
plt.show()`;
}

export function buildDescStats() {
  return `# Descriptive statistics
print("=== NUMERIC FEATURES ===")
print(df.describe().round(3).to_string())

print("\\n=== CATEGORICAL FEATURES ===")
cat_cols = df.select_dtypes(include=['object', 'bool']).columns
for col in cat_cols:
    print(f"\\n{col}: {df[col].nunique()} unique values")
    print(df[col].value_counts().head(5).to_string())`;
}

export function buildDistCode(numCols: string[], catCols: string[]) {
  const nc = numCols
    .slice(0, 6)
    .map(c => `'${c}'`)
    .join(', ');
  const cc = catCols
    .slice(0, 4)
    .map(c => `'${c}'`)
    .join(', ');
  return `# Distribution plots
numeric_cols = [${nc}]
cat_cols = [${cc}]

# Numeric distributions
if numeric_cols:
    fig, axes = plt.subplots(2, 3, figsize=(16, 10))
    axes = axes.flatten()
    for i, col in enumerate(numeric_cols[:6]):
        sns.histplot(df[col].dropna(), ax=axes[i], kde=True,
                     color='#e8778f', edgecolor='white', alpha=0.7)
        axes[i].set_title(f'{col}', fontsize=11)
        axes[i].set_xlabel('')
    plt.suptitle('Numeric Feature Distributions', fontsize=14, y=1.02)
    plt.tight_layout()
    plt.show()

# Categorical bar charts
if cat_cols:
    n_cats = len(cat_cols)
    fig, axes = plt.subplots(1, n_cats, figsize=(5*n_cats, 5))
    if n_cats == 1: axes = [axes]
    for i, col in enumerate(cat_cols):
        top = df[col].value_counts().head(10)
        top.plot(kind='barh', ax=axes[i], color='#9b89d4', edgecolor='white')
        axes[i].set_title(f'Top values: {col}', fontsize=11)
    plt.tight_layout()
    plt.show()`;
}

export function buildCorrCode(numCols: string[]) {
  const nc = numCols
    .slice(0, 10)
    .map(c => `'${c}'`)
    .join(', ');
  return `# Correlation analysis
numeric_cols = [${nc}]
corr_df = df[numeric_cols].corr()

fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# Heatmap
mask = np.triu(np.ones_like(corr_df, dtype=bool))
cmap = sns.diverging_palette(340, 170, as_cmap=True)
sns.heatmap(corr_df, mask=mask, ax=axes[0], cmap=cmap, center=0,
            annot=True, fmt='.2f', square=True, linewidths=0.5,
            annot_kws={'size': 9})
axes[0].set_title('Correlation Heatmap', fontsize=13)

# Top correlations bar chart
corr_pairs = corr_df.unstack()
corr_pairs = corr_pairs[corr_pairs.index.get_level_values(0) < corr_pairs.index.get_level_values(1)]
top_corr = corr_pairs.abs().sort_values(ascending=False).head(10)
colors = ['#e8778f' if corr_pairs[i] > 0 else '#6a9fc4' for i in top_corr.index]
top_corr.plot(kind='bar', ax=axes[1], color=colors, edgecolor='white')
axes[1].set_title('Top 10 Correlations (|r|)', fontsize=13)
axes[1].set_ylabel('|Pearson r|')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.show()`;
}

export function buildOutlierCode(numCols: string[]) {
  const nc = numCols
    .slice(0, 6)
    .map(c => `'${c}'`)
    .join(', ');
  return `# Outlier detection
numeric_cols = [${nc}]

fig, axes = plt.subplots(2, 3, figsize=(16, 10))
axes = axes.flatten()

for i, col in enumerate(numeric_cols[:6]):
    sns.boxplot(y=df[col].dropna(), ax=axes[i],
                color='#c5b8e8', flierprops={'marker':'o','markersize':4,'alpha':0.5})
    axes[i].set_title(f'{col}', fontsize=11)

plt.suptitle('Outlier Detection (IQR Method)', fontsize=14, y=1.02)
plt.tight_layout()
plt.show()

# Z-score method
from scipy import stats as sp
for col in numeric_cols:
    z = np.abs(sp.zscore(df[col].dropna()))
    extreme = (z > 3).sum()
    if extreme > 0:
        print(f"Z-score anomalies in '{col}': {extreme} values beyond ±3σ")`;
}

export function buildPatternCode(numCols: string[]) {
  const nc = numCols
    .slice(0, 4)
    .map(c => `'${c}'`)
    .join(', ');
  return `# Pattern analysis
numeric_cols = [${nc}]

# Rolling statistics (if time-series)
# Uncomment if your data has a time column:
# df_sorted = df.sort_values('date_column')
# df_sorted['rolling_mean'] = df_sorted['target_col'].rolling(7).mean()

# KDE overlay comparison
fig, axes = plt.subplots(1, len(numeric_cols), figsize=(5*len(numeric_cols), 5))
if len(numeric_cols) == 1: axes = [axes]
for i, col in enumerate(numeric_cols):
    data = df[col].dropna()
    sns.kdeplot(data, ax=axes[i], fill=True, color='#e8778f', alpha=0.5)
    axes[i].axvline(data.mean(), color='#c44d6a', linestyle='--', label='Mean')
    axes[i].axvline(data.median(), color='#6fa896', linestyle='--', label='Median')
    axes[i].set_title(f'KDE: {col}', fontsize=11)
    axes[i].legend()
plt.tight_layout()
plt.show()`;
}

export function buildPairplotCode(numCols: string[]) {
  const nc = numCols
    .slice(0, 5)
    .map(c => `'${c}'`)
    .join(', ');
  return `# Pairplot for numeric features
numeric_cols = [${nc}]
sample_df = df[numeric_cols].dropna().sample(min(500, len(df)), random_state=42)

g = sns.pairplot(
    sample_df,
    diag_kind='kde',
    plot_kws={'alpha': 0.4, 'color': '#9b89d4', 's': 15},
    diag_kws={'color': '#e8778f', 'fill': True, 'alpha': 0.6}
)
g.fig.suptitle('Pairplot — Numeric Feature Relationships', y=1.02, fontsize=13)
plt.show()

print("\\n✅ EDA complete! Review the patterns above and proceed with feature engineering.")`;
}

export function getFullNotebookCode(analysis: AnalysisResult, fileName: string): string {
  const sections = [
    buildImportsCode(),
    buildLoadCode(fileName),
    buildOverviewCode(),
    buildMissingCode(),
    buildDescStats(),
    buildDistCode(analysis.numCols, analysis.catCols),
    buildCorrCode(analysis.numCols),
    buildOutlierCode(analysis.numCols),
    buildPatternCode(analysis.numCols),
    buildPairplotCode(analysis.numCols),
  ];
  return sections.join('\n\n# ' + '─'.repeat(50) + '\n\n');
}

export function buildJupyterNotebook(analysis: AnalysisResult, fileName: string) {
  const cells = [
    {
      cell_type: 'markdown',
      source: `# EDA Analysis: ${fileName}\n\n*Auto-generated by EDA Studio*`,
    },
    { cell_type: 'code', source: buildImportsCode() },
    { cell_type: 'code', source: buildLoadCode(fileName) },
    { cell_type: 'markdown', source: '## 1. Dataset overview' },
    { cell_type: 'code', source: buildOverviewCode() },
    { cell_type: 'markdown', source: '## 2. Missing values' },
    { cell_type: 'code', source: buildMissingCode() },
    { cell_type: 'markdown', source: '## 3. Statistics' },
    { cell_type: 'code', source: buildDescStats() },
    { cell_type: 'markdown', source: '## 4. Distributions' },
    { cell_type: 'code', source: buildDistCode(analysis.numCols, analysis.catCols) },
    { cell_type: 'markdown', source: '## 5. Correlations' },
    { cell_type: 'code', source: buildCorrCode(analysis.numCols) },
    { cell_type: 'markdown', source: '## 6. Outliers' },
    { cell_type: 'code', source: buildOutlierCode(analysis.numCols) },
    { cell_type: 'markdown', source: '## 7. Patterns' },
    { cell_type: 'code', source: buildPatternCode(analysis.numCols) },
    { cell_type: 'markdown', source: '## 8. Pairplot' },
    { cell_type: 'code', source: buildPairplotCode(analysis.numCols) },
  ];
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: 'Python 3',
        language: 'python',
        name: 'python3',
      },
      language_info: { name: 'python', version: '3.11.0' },
    },
    cells: cells.map(c => ({
      cell_type: c.cell_type,
      metadata: {},
      source: c.source,
      outputs: [],
      execution_count: null,
    })),
  };
}
