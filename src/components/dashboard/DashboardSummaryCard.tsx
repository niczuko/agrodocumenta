
import React from 'react';
import { Glass } from '@/components/ui/Glass';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface DashboardSummaryCardProps {
  icon: React.ReactNode;
  count: number;
  title: string;
  linkTo: string;
  linkText?: string;
}

export const DashboardSummaryCard: React.FC<DashboardSummaryCardProps> = ({ 
  icon, 
  count, 
  title, 
  linkTo,
  linkText = "Ver todas"
}) => {
  return (
    <Glass className="p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-3xl font-semibold">{count}</div>
          <div className="text-mono-600">{title}</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-mono-100">
        <Link to={linkTo} className="text-primary hover:underline text-sm flex items-center">
          <span>{linkText}</span>
          <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
        </Link>
      </div>
    </Glass>
  );
};
