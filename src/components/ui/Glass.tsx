
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
  intensity?: 'low' | 'medium' | 'high';
  hover?: boolean;
}

const Glass = React.forwardRef<HTMLDivElement, GlassProps>(
  ({ className, variant = 'light', intensity = 'medium', hover = false, children, ...props }, ref) => {
    // Configura opacidade com base na intensidade
    const opacityMap = {
      low: variant === 'light' ? 'bg-white/30' : 'bg-mono-900/30',
      medium: variant === 'light' ? 'bg-white/60' : 'bg-mono-900/60',
      high: variant === 'light' ? 'bg-white/80' : 'bg-mono-900/80'
    };
    
    // Configura efeito blur com base na intensidade
    const blurMap = {
      low: 'backdrop-blur-sm',
      medium: 'backdrop-blur-md',
      high: 'backdrop-blur-lg'
    };
    
    // Configura a borda
    const borderClass = variant === 'light' 
      ? 'border border-white/20' 
      : 'border border-mono-800/50';
    
    // Efeito hover
    const hoverClass = hover 
      ? 'transition-all duration-300 hover:shadow-glass-hover'
      : '';
    
    return (
      <div
        ref={ref}
        className={cn(
          opacityMap[intensity],
          blurMap[intensity],
          borderClass,
          'shadow-glass rounded-xl',
          hoverClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Glass.displayName = 'Glass';

export { Glass };
