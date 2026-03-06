import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import TransactionTable from '../components/TransactionTable';
import api from '../services/api';
import { Download, Search } from 'lucide-react';
import type { Transaction } from '../components/TransactionTable';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Transactions = () => {
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useDocumentTitle('Transactions');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 20 };
      if (typeFilter) params.type = typeFilter;
      if (bankFilter) params.bankProvider = bankFilter;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;
      if (search) params.search = search;
      const response = await api.get('/transactions', { params });
      setTransactions(response.data.transactions || []);
      setTotalPages(response.data.totalPages || 1);
    } catch {
      /* errors handled by interceptor */
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, bankFilter, dateFrom, dateTo, search]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = () => {
    setPage(1);
    fetchTransactions();
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <button
          onClick={() => {
            const headers = ['Date', 'Type', 'Bank', 'Description', 'Amount', 'Balance'];
            const rows = transactions.map((t) => [
              new Date(t.transactionDate).toISOString().split('T')[0],
              t.type,
              t.bankProvider,
              `"${t.description.replace(/"/g, '""')}"`,
              t.amount,
              t.balance,
            ]);
            const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transactions.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="To date"
        />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">All Types</option>
          <option value="DEPOSIT">Deposit</option>
          <option value="WITHDRAWAL">Withdrawal</option>
          <option value="TRANSFER">Transfer</option>
          <option value="FEE">Fee</option>
        </select>
        <select
          value={bankFilter}
          onChange={(e) => { setBankFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">All Banks</option>
          <option value="MPESA">M-Pesa</option>
          <option value="KCB">KCB</option>
          <option value="EQUITY">Equity</option>
          <option value="COOPERATIVE">Co-operative</option>
        </select>
        <div className="flex gap-2">
          <div className="flex items-center flex-1 border border-slate-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search..."
              className="w-full py-2 pl-2 text-sm outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      <TransactionTable
        transactions={transactions}
        loading={loading}
        showPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </Layout>
  );
};

export default Transactions;
