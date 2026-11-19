import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'teal' | 'neutral' | 'warning' | 'danger' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
}) => {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    teal: 'bg-teal/10 text-teal border-teal/20',
    neutral: 'bg-gray-100 text-text-secondary border-gray-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
};

