import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('p-6 border-b border-gray-200', className)}>
    {children}
  </div>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('p-6', className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('p-6 border-t border-gray-200', className)}>
    {children}
  </div>
);
