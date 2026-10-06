import React from 'react';
import { SportType } from '@/types/sports';
import { SPORTS_REGISTRY } from '@/lib/sports-config';
import { Trophy, Activity, Zap, Target, Timer, Flame, Disc, Footprints } from 'lucide-react';

interface SportBadgeProps {
  sport: SportType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SportIconMap: Record<SportType, React.ElementType> = {
  cricket: Trophy,
  volleyball: Activity,
  kabaddi: Zap,
  badminton: Target,
  'kho-kho': Timer,
  throwball: Flame,
  'table-tennis': Disc,
  athletics: Footprints,
};

export const SportBadge: React.FC<SportBadgeProps> = ({ sport, showIcon = true, size = 'md' }) => {
  const config = SPORTS_REGISTRY[sport] || SPORTS_REGISTRY.cricket;
  const IconComponent = SportIconMap[sport] || Trophy;

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5 font-bold',
    md: 'text-xs font-semibold px-3 py-1 gap-1.5',
    lg: 'text-sm font-bold px-4 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md tracking-wider uppercase transition-all ${sizeClasses}`}
      style={{
        borderColor: `${config.accentColor}60`,
        backgroundColor: `${config.accentColor}18`,
        color: '#f8fafc',
        boxShadow: `0 0 14px -2px ${config.accentColor}35, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
      }}
    >
      {showIcon && <IconComponent className={iconSizes} style={{ color: config.accentColor }} />}
      <span>{config.name}</span>
    </span>
  );
};
