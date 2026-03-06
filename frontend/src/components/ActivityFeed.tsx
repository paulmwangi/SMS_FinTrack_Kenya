import { useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  amount?: number;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const iconMap: Record<string, React.ReactNode> = {
  DEPOSIT: <ArrowDownLeft className="w-4 h-4 text-emerald-500" />,
  WITHDRAWAL: <ArrowUpRight className="w-4 h-4 text-red-500" />,
  TRANSFER: <RefreshCw className="w-4 h-4 text-blue-500" />,
};

const dotColor: Record<string, string> = {
  DEPOSIT: 'bg-emerald-500',
  WITHDRAWAL: 'bg-red-500',
  TRANSFER: 'bg-blue-500',
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
  });
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const items = activities.slice(0, 10);
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Recent Activity
        </h3>
        {activities.length > 10 && (
          <button
            onClick={() => navigate('/transactions')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View all
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          No recent activity
        </p>
      ) : (
        <div className="space-y-0">
          {items.map((activity, idx) => (
            <div key={activity.id} className="flex gap-3">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    'w-2.5 h-2.5 rounded-full mt-1.5 shrink-0',
                    dotColor[activity.type] || 'bg-slate-300'
                  )}
                />
                {idx < items.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200 my-1" />
                )}
              </div>
              {/* Content */}
              <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {iconMap[activity.type] || (
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                    )}
                    <p className="text-sm text-slate-700 truncate">
                      {activity.description}
                    </p>
                  </div>
                  {activity.amount != null && (
                    <span
                      className={clsx(
                        'text-sm font-semibold whitespace-nowrap',
                        activity.type === 'DEPOSIT'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      )}
                    >
                      {activity.type === 'DEPOSIT' ? '+' : '-'} KES{' '}
                      {activity.amount.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {relativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
