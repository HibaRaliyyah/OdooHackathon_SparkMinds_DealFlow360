import React from 'react';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  minWidth?: string;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No data available',
  onRowClick,
  minWidth = '1000px',
}: TableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-[var(--text-tertiary)] text-sm border border-dashed border-[var(--border-subtle)] rounded-xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="table-container overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
      <table className="w-full text-left text-sm border-collapse" style={{ minWidth }}>
        <thead className="bg-[var(--bg-card-hover)] border-b border-[var(--border-subtle)]">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-card)]">
          {data.map((item, idx) => (
            <tr
              key={`${keyExtractor(item)}-${idx}`}
              onClick={() => onRowClick && onRowClick(item)}
              className={`table-row transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[var(--bg-card-hover)]' : ''}`}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`px-4 py-3.5 text-sm text-[var(--text-secondary)] whitespace-nowrap ${col.className || ''}`}>
                  {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? '') : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
