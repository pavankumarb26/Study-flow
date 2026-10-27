import React from 'react';
import { getSubjectColor } from '../../utils/dateUtils';

interface BadgeProps {
  subject: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const SubjectBadge: React.FC<BadgeProps> = ({
  subject,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const color = getSubjectColor(subject);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}35`,
        color: color,
      }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{subject}</span>
    </span>
  );
};
