import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { FileText, Download, Calendar, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuthStore } from '../store/authStore';

interface Statement {
  id: string;
  month: number;
  year: number;
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  createdAt?: string;
}

interface MemberOption {
  id: string;
  firstName: string;
  lastName: string;
}

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const Statements = () => {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const { user } = useAuthStore();

  const isAdmin = user && ['ADMIN', 'TREASURER', 'CHAIRMAN'].includes(user.role);

  useDocumentTitle('Statements');

  const fetchStatements = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (isAdmin && selectedMemberId) {
        params.memberId = selectedMemberId;
      }
      const response = await api.get('/statements', { params });
      setStatements(response.data.statements || response.data || []);
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false);
    }
  }, [isAdmin, selectedMemberId]);

  const fetchMembers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await api.get('/members');
      setMembers(response.data.members || []);
    } catch {
      /* handled by interceptor */
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const body: Record<string, unknown> = {
        month: selectedMonth,
        year: selectedYear,
      };
      if (isAdmin && selectedMemberId) {
        body.memberId = selectedMemberId;
      }
      await api.post('/statements/generate', body);
      fetchStatements();
    } catch {
      /* handled by interceptor */
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (statementId: string) => {
    if (!confirm('Are you sure you want to delete this statement?')) {
      return;
    }
    try {
      await api.delete(`/statements/${statementId}`);
      fetchStatements();
    } catch {
      /* handled by interceptor */
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Statements</h1>
      </div>

      {/* Generate statement */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Generate Statement
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
          {isAdmin && members.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Member
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select a member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Statement'}
          </button>
        </div>
      </div>

      {/* Statements list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
            >
              <div className="h-5 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : statements.length === 0 ? (
        <EmptyState
          title="No statements yet"
          description="Generate your first monthly statement using the form above."
          icon={<Calendar className="w-16 h-16" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statements.map((stmt) => (
            <div
              key={stmt.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">
                  {months[stmt.month - 1]} {stmt.year}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const response = await api.get(`/statements/${stmt.id}/download`, {
                          responseType: 'blob',
                        });
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `statement-${months[stmt.month - 1]}-${stmt.year}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch {
                        /* handled by interceptor */
                      }
                    }}
                    className="text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(stmt.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Statement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Opening Balance</span>
                  <span className="font-medium text-slate-800">
                    KES {stmt.openingBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Closing Balance</span>
                  <span className="font-medium text-slate-800">
                    KES {stmt.closingBalance.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deposits</span>
                    <span
                      className={clsx(
                        'font-medium',
                        stmt.totalDeposits > 0
                          ? 'text-emerald-600'
                          : 'text-slate-600'
                      )}
                    >
                      +KES {stmt.totalDeposits.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-500">Withdrawals</span>
                    <span
                      className={clsx(
                        'font-medium',
                        stmt.totalWithdrawals > 0
                          ? 'text-red-600'
                          : 'text-slate-600'
                      )}
                    >
                      -KES {stmt.totalWithdrawals.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Statements;
