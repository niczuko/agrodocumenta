
import React from 'react';
import { cn } from '@/lib/utils';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageTitle({ 
  title, 
  subtitle, 
  icon, 
  action,
  className 
}: PageTitleProps) {
  return (
    <div className={cn("mb-8 animate-fade-in", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <i className={`${icon} text-lg`}></i>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-mono-900">{title}</h1>
            {subtitle && <p className="text-mono-600 mt-1">{subtitle}</p>}
          </div>
        </div>
        
        {action && (
          <div className="md:ml-auto">{action}</div>
        )}
      </div>
    </div>
  );
}
