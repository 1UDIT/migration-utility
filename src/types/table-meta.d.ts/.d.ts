// src/types/table-meta.d.ts
import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    /** How the column renders/handles filtering UI */
    filterVariant?: 'text' | 'select';
    /** Options for select variant (can be strings or {label,value}) */
    options?: Array<string | { label: string; value: string }>;
    /** Optional placeholder for inputs */
    placeholder?: string;
  }
}

export {};
