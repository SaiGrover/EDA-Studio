'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import type { DataRow } from '@/types/analysis';

interface Props {
  rows: DataRow[];
  cols: string[];
}

export default function RawDataTab({ rows, cols }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<DataRow>[]>(
    () =>
      cols.map(col => ({
        accessorKey: col,
        header: col,
        cell: info => {
          const val = info.getValue();
          return (
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.76rem',
                color: typeof val === 'number' ? '#2d6a96' : '#2d2820',
              }}
            >
              {val === null || val === undefined || val === '' ? (
                <span style={{ color: '#e8778f', fontStyle: 'italic' }}>null</span>
              ) : (
                String(val).length > 24 ? String(val).slice(0, 22) + '…' : String(val)
              )}
            </span>
          );
        },
      })),
    [cols]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Search bar */}
      <div className="mb-4 flex items-center gap-3">
        <input
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search across all columns…"
          className="flex-1 px-4 py-2 rounded-xl text-sm outline-none transition-all"
          style={{
            background: '#ffffff',
            border: '1.5px solid rgba(45,40,32,0.14)',
            color: '#2d2820',
            fontFamily: "'DM Sans', sans-serif",
            maxWidth: '360px',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#e8778f'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(45,40,32,0.14)'; }}
        />
        <span className="text-xs" style={{ color: '#a09890' }}>
          {table.getFilteredRowModel().rows.length.toLocaleString()} rows
        </span>
      </div>

      {/* Table */}
      <div
        className="rounded-[16px] overflow-hidden border"
        style={{ border: '1px solid rgba(45,40,32,0.10)', background: '#ffffff' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} style={{ background: '#faf7f2', borderBottom: '1px solid rgba(45,40,32,0.10)' }}>
                  {hg.headers.map(header => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        textAlign: 'left',
                        padding: '9px 14px',
                        fontWeight: 500,
                        color: '#a09890',
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <span className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && ' ↑'}
                        {header.column.getIsSorted() === 'desc' && ' ↓'}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  style={{ borderBottom: '1px solid rgba(45,40,32,0.06)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fdf0f3'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      style={{
                        padding: '7px 14px',
                        whiteSpace: 'nowrap',
                        maxWidth: '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(45,40,32,0.14)',
              color: table.getCanPreviousPage() ? '#6b6258' : '#d0c8c0',
              cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Prev
          </button>
          <span className="text-xs" style={{ color: '#6b6258' }}>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(45,40,32,0.14)',
              color: table.getCanNextPage() ? '#6b6258' : '#d0c8c0',
              cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Next →
          </button>
        </div>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className="text-xs rounded-lg px-2 py-1 outline-none"
          style={{
            background: '#ffffff',
            border: '1.5px solid rgba(45,40,32,0.14)',
            color: '#6b6258',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {[10, 15, 25, 50].map(size => (
            <option key={size} value={size}>
              {size} rows
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}
