import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => (
  <div className={cn('bg-white shadow-sm rounded-lg overflow-hidden', className)}>
    <table className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<TableProps> = ({ children }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
);

export const TableBody: React.FC<TableProps> = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

export const TableRow: React.FC<TableProps> = ({ children, className }) => (
  <tr className={className}>
    {children}
  </tr>
);

export const TableCell: React.FC<TableProps & { align?: 'left' | 'center' | 'right' }> = ({
  children,
  className,
  align = 'left'
}) => (
  <td className={cn('px-6 py-4 whitespace-nowrap', {
    'text-left': align === 'left',
    'text-center': align === 'center',
    'text-right': align === 'right'
  }, className)}>
    {children}
  </td>
);

export const TableHeaderCell: React.FC<TableProps & { align?: 'left' | 'center' | 'right' }> = ({
  children,
  className,
  align = 'left'
}) => (
  <th className={cn('px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', {
    'text-left': align === 'left',
    'text-center': align === 'center',
    'text-right': align === 'right'
  }, className)}>
    {children}
  </th>
);