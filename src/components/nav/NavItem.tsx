import React from 'react';
import { Link } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  external?: boolean;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ 
  to, 
  icon, 
  label, 
  isActive,
  external,
  onClick
}) => {
  const Component = external ? 'button' : Link;
  const props = external ? { onClick } : { to };

  return (
    <Component
      {...props}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-indigo-100 text-indigo-700' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
      {external && (
        <svg
          className="w-3 h-3 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </Component>
  );
};