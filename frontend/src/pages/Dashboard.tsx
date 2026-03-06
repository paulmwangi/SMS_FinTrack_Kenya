import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import TransactionTable from '../components/TransactionTable';
import Chart from '../components/Chart';
import ActivityFeed from '../components/ActivityFeed';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import type { Transaction } from '../components/TransactionTable';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useDocumentTitle('Dashboard');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions');
      setTransactions(response.data.transactions || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch transactions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, [user, navigate, fetchTransactions]);

  const totalDeposits = transactions
    .filter((t) => t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0);

  const latestBalance =
    transactions.length > 0 ? transactions[0].balance : 0;

  // Build chart data grouped by date
  const chartMap = new Map<string, { deposits: number; withdrawals: number }>();
  transactions.forEach((t) => {
    const date = new Date(t.transactionDate).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
    });
    const entry = chartMap.get(date) || { deposits: 0, withdrawals: 0 };
    if (t.type === 'DEPOSIT') entry.deposits += t.amount;
    else entry.withdrawals += t.amount;
    chartMap.set(date, entry);
  });
  const chartData = Array.from(chartMap.entries())
    .map(([date, vals]) => ({ date, ...vals }))
    .reverse();

  const activities = transactions.slice(0, 15).map((t) => ({
    id: t.id,
    type: t.type,
    description: t.description,
    timestamp: t.transactionDate,
    amount: t.amount,
  }));

  const today = new Date().toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Layout>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.email?.split('@')[0] || 'User'} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">{today}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Balance"
          value={`KES ${latestBalance.toLocaleString()}`}
          icon={<Wallet className="w-6 h-6" />}
          change="Current balance"
          changeType="neutral"
        />
        <StatCard
          title="Total Deposits"
          value={`KES ${totalDeposits.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          change={`${transactions.filter((t) => t.type === 'DEPOSIT').length} transactions`}
          changeType="positive"
        />
        <StatCard
          title="Total Withdrawals"
          value={`KES ${totalWithdrawals.toLocaleString()}`}
          icon={<TrendingDown className="w-6 h-6" />}
          change={`${transactions.filter((t) => t.type === 'WITHDRAWAL').length} transactions`}
          changeType="negative"
        />
        <StatCard
          title="Transaction Count"
          value={String(transactions.length)}
          icon={<ArrowLeftRight className="w-6 h-6" />}
          change="All time"
          changeType="neutral"
        />
      </div>

      {/* Chart + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Chart data={chartData} />
        </div>
        <div>
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Recent Transactions
        </h2>
        <TransactionTable
          transactions={transactions.slice(0, 10)}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
