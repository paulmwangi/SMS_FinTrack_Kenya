import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, changeType = 'neutral', icon }: StatCardProps) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
          {icon}
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1.5">
          {changeType === 'positive' && (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          )}
          {changeType === 'negative' && (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          {changeType === 'neutral' && (
            <Minus className="w-4 h-4 text-slate-400" />
          )}
          <span
            className={clsx(
              'text-sm font-medium',
              changeType === 'positive' && 'text-emerald-600',
              changeType === 'negative' && 'text-red-600',
              changeType === 'neutral' && 'text-slate-500'
            )}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
