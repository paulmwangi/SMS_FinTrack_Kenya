import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartProps {
  data: Array<{ date: string; deposits: number; withdrawals: number }>;
  type?: 'area' | 'bar' | 'line';
}

const formatKES = (value: number) =>
  `KES ${value.toLocaleString()}`;

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatKES(entry.value)}
        </p>
      ))}
    </div>
  );
};

const Chart = ({ data, type = 'area' }: ChartProps) => {
  const commonProps = {
    data,
    margin: { top: 10, right: 10, left: 0, bottom: 0 },
  };

  const xAxisProps = {
    dataKey: 'date',
    tick: { fontSize: 12, fill: '#94a3b8' },
    tickLine: false,
    axisLine: false,
  };

  const yAxisProps = {
    tick: { fontSize: 12, fill: '#94a3b8' },
    tickLine: false,
    axisLine: false,
    tickFormatter: (v: number) => `${(v / 1000).toFixed(0)}k`,
  };

  const renderChart = () => {
    if (type === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="withdrawals" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }

    if (type === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="deposits"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4, fill: '#10b981' }}
          />
          <Line
            type="monotone"
            dataKey="withdrawals"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={{ r: 4, fill: '#f43f5e' }}
          />
        </LineChart>
      );
    }

    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="depositGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="withdrawalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="deposits"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#depositGrad)"
        />
        <Area
          type="monotone"
          dataKey="withdrawals"
          stroke="#f43f5e"
          strokeWidth={2}
          fill="url(#withdrawalGrad)"
        />
      </AreaChart>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Transaction Trends
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            Deposits
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            Withdrawals
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
