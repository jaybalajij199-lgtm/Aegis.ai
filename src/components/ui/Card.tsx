import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'outline';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200';
  const variantStyles = {
    glass: 'glass-panel',
    solid: 'bg-white border border-slate-200 text-[#172033] shadow-[0_2px_8px_rgba(15,23,42,0.06)]',
    outline: 'border border-slate-200 bg-slate-50'
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
