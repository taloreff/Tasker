'use client';

import { cn } from '@/lib/utils';
import { colorOptions } from '@/lib/consts';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ring' | 'border' | 'scale';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-10 h-10',
};

const variantClasses = {
  ring: {
    base: 'rounded-full cursor-pointer hover:opacity-80 transition-all duration-300',
    selected: 'ring-2 ring-offset-2 ring-primary',
    unselected: '',
  },
  border: {
    base: 'rounded-full border-2 transition-all cursor-pointer',
    selected: 'border-foreground scale-110',
    unselected: 'border-muted-foreground/20 hover:border-muted-foreground/40',
  },
  scale: {
    base: 'rounded-full cursor-pointer transition-all duration-200 hover:scale-105',
    selected: 'scale-110 ring-2 ring-primary ring-offset-2',
    unselected: 'hover:opacity-80',
  },
};

export function ColorPicker({ 
  value, 
  onChange, 
  size = 'md', 
  variant = 'ring',
  className 
}: ColorPickerProps) {
  const sizeClass = sizeClasses[size];
  const variantConfig = variantClasses[variant];

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {colorOptions.map((color) => {
        const isSelected = value === color;
        
        return (
          <button
            key={color}
            type="button"
            className={cn(
              sizeClass,
              variantConfig.base,
              isSelected ? variantConfig.selected : variantConfig.unselected
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Select color ${color}`}
          />
        );
      })}
    </div>
  );
}