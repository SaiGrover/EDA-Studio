import assert from 'node:assert/strict';
import test from 'node:test';
import { analyseData, pearsonCorr } from '../lib/analysis';

test('uses original-row pairs without zero filling or dropping unrelated missing values', () => {
  const result = analyseData([
    { x: 1, y: 10, z: null },
    { x: 2, y: null, z: 20 },
    { x: null, y: 30, z: 30 },
    { x: 4, y: 40, z: 40 },
    { x: 5, y: 50, z: '' },
    { x: '', y: 60, z: 60 },
  ], ['x', 'y', 'z']);
  assert.ok(Math.abs(result.corrMatrix.x.y! - 1) < 1e-12);
  assert.deepEqual(result.corrSampleSizes, {
    x: { x: 4, y: 3, z: 2 },
    y: { x: 3, y: 5, z: 3 },
    z: { x: 2, y: 3, z: 4 },
  });
  assert.ok(result.patterns.some(p => p.desc.includes('n = 3 paired rows')));
  for (const a of result.numCols) {
    for (const b of result.numCols) {
      assert.equal(result.corrMatrix[a][b], result.corrMatrix[b][a]);
    }
  }
});

test('never independently compacts columns when their missing rows differ', () => {
  const result = analyseData([
    { x: 1, y: 30 }, { x: 2, y: null }, { x: null, y: 20 }, { x: 3, y: 10 },
  ], ['x', 'y']);
  assert.ok(Math.abs(result.corrMatrix.x.y! + 1) < 1e-12);
  assert.equal(result.corrSampleSizes.x.y, 2);
});

test('excludes absent, blank and infinite values but retains numeric strings and real zeros', () => {
  const result = analyseData([
    { x: '0', y: '0' }, { x: '2', y: '4' },
    { x: ' ', y: 8 }, { x: 3, y: '' }, { y: 10 },
    { x: Infinity, y: 12 }, { x: '-Infinity', y: 14 },
  ], ['x', 'y']);
  assert.equal(result.corrSampleSizes.x.y, 2);
  assert.ok(Math.abs(result.corrMatrix.x.y! - 1) < 1e-12);
});

test('reports null with actual n for no overlap, one pair and constant paired subsets', () => {
  const result = analyseData([
    { x: 1, y: null, z: 5, constant: 7 },
    { x: 2, y: null, z: null, constant: 7 },
    { x: null, y: 3, z: 5, constant: 7 },
    { x: null, y: 4, z: 5, constant: 7 },
    { x: null, y: null, z: 6, constant: 7 },
  ], ['x', 'y', 'z', 'constant']);
  assert.equal(result.corrMatrix.x.y, null);
  assert.equal(result.corrSampleSizes.x.y, 0);
  assert.equal(result.corrMatrix.x.z, null);
  assert.equal(result.corrSampleSizes.x.z, 1);
  assert.equal(result.corrMatrix.y.z, null);
  assert.equal(result.corrSampleSizes.y.z, 2);
  assert.equal(result.corrMatrix.constant.constant, null);
  assert.equal(result.corrSampleSizes.constant.constant, 5);
  assert.equal(result.patterns.filter(p => p.type === 'correlation').length, 0);
  assert.equal(JSON.parse(JSON.stringify(result)).corrMatrix.x.y, null);
});

test('keeps valid zero correlations distinct from unavailable results', () => {
  const result = analyseData([
    { x: -1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: 1 },
  ], ['x', 'y']);
  assert.equal(result.corrMatrix.x.y, 0);
  assert.equal(result.corrSampleSizes.x.y, 3);
});

test('handles empty, all-missing and single-row datasets', () => {
  assert.deepEqual(analyseData([], []).corrSampleSizes, {});
  assert.deepEqual(analyseData([{ x: null, y: '' }], ['x', 'y']).corrMatrix, {});
  const single = analyseData([{ x: 1, y: 2 }], ['x', 'y']);
  assert.equal(single.corrMatrix.x.x, null);
  assert.equal(single.corrMatrix.x.y, null);
  assert.equal(single.corrSampleSizes.x.y, 1);
});

test('Pearson validates paired input and preserves ordinary coefficients', () => {
  assert.equal(pearsonCorr([], []), null);
  assert.equal(pearsonCorr([1], [2]), null);
  assert.equal(pearsonCorr([1, 2], [2]), null);
  assert.equal(pearsonCorr([1, 1], [2, 3]), null);
  assert.equal(pearsonCorr([1, NaN], [2, 3]), null);
  assert.ok(Math.abs(pearsonCorr([1, 2, 3], [1, 3, 2])! - 0.5) < 1e-12);
});
