import clsx from 'clsx';

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  bankProvider: string;
  transactionDate: string;
  reference?: string;
  member?: { firstName: string; lastName: string };
}

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  showPagination?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const typeBadge: Record<string, string> = {
  DEPOSIT: 'bg-emerald-100 text-emerald-700',
  WITHDRAWAL: 'bg-red-100 text-red-700',
  TRANSFER: 'bg-blue-100 text-blue-700',
  FEE: 'bg-orange-100 text-orange-700',
};

const bankBadge: Record<string, string> = {
  MPESA: 'bg-green-50 text-green-700',
  KCB: 'bg-blue-50 text-blue-700',
  EQUITY: 'bg-orange-50 text-orange-700',
  COOPERATIVE: 'bg-purple-50 text-purple-700',
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

const TransactionTable = ({
  transactions,
  loading = false,
  showPagination = false,
  page = 1,
  totalPages = 1,
  onPageChange,
}: TransactionTableProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Date', 'Type', 'Bank', 'Description', 'Amount', 'Balance'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="text-slate-400 text-5xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">
          No transactions found
        </h3>
        <p className="text-sm text-slate-500">
          Transactions will appear here once SMS messages are processed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Date', 'Type', 'Bank', 'Description', 'Amount', 'Balance'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx, idx) => (
              <tr
                key={tx.id}
                className={clsx(
                  'hover:bg-emerald-50/30 transition-colors',
                  idx % 2 === 1 && 'bg-slate-50/50'
                )}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {new Date(tx.transactionDate).toLocaleDateString('en-KE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={clsx(
                      'px-2.5 py-1 rounded-full text-xs font-semibold',
                      typeBadge[tx.type] || 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={clsx(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      bankBadge[tx.bankProvider] || 'bg-slate-50 text-slate-600'
                    )}
                  >
                    {tx.bankProvider}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                  {tx.member && (
                    <span className="font-medium text-slate-800">
                      {tx.member.firstName} {tx.member.lastName} &middot;{' '}
                    </span>
                  )}
                  {tx.description}
                </td>
                <td
                  className={clsx(
                    'px-6 py-4 whitespace-nowrap text-sm font-semibold',
                    tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {tx.type === 'DEPOSIT' ? '+' : '-'} KES{' '}
                  {tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                  KES {tx.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
