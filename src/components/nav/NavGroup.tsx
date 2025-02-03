import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface NavGroupProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const NavGroup: React.FC<NavGroupProps> = ({ 
  title, 
  icon, 
  children,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
      >
        <div className="flex items-center space-x-3">
          <span className="flex-shrink-0">{icon}</span>
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
      </button>
      {isOpen && (
        <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};