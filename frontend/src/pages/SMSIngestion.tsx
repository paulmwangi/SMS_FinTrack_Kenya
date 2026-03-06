import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { MessageSquare, Send, Copy, ArrowRight, CheckCircle, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const sampleSMS = [
  {
    label: 'M-Pesa Deposit',
    phone: '+254712345678',
    body: 'RKH4D9MPQR Confirmed. Ksh5,000.00 deposited to your M-Pesa account on 15/1/25 at 2:30 PM. New M-Pesa balance is Ksh12,500.00.',
  },
  {
    label: 'M-Pesa Withdrawal',
    phone: '+254712345678',
    body: 'TN8W3XKLVB Confirmed. Ksh2,000.00 withdrawn from your M-Pesa account on 15/1/25 at 3:45 PM. New M-Pesa balance is Ksh10,500.00.',
  },
  {
    label: 'M-Pesa Send Money',
    phone: '+254712345678',
    body: 'SJK5P2RQWZ Confirmed. Ksh1,500.00 sent to Jane Doe 0722654321 on 20/2/25 at 11:00 AM. New M-PESA balance is Ksh9,000.00.',
  },
  {
    label: 'KCB Transfer',
    phone: '+254712345678',
    body: 'KCB: You have received Ksh15,000.00 from John Doe on 15/01/2025. Your new balance is Ksh45,000.00. Ref: TRF2025011500123.',
  },
  {
    label: 'Equity Bank Credit',
    phone: '+254712345678',
    body: 'Your Equity a/c XXX1234 has been credited with KES 10,000.00 on 17/02/26. Bal: KES 30,000.00. Ref: FT26048ABC',
  },
  {
    label: 'Co-op Bank Debit',
    phone: '+254712345678',
    body: 'Co-operative Bank A/C XXX789 DR KES 7,500.00 on 17/02/26. Bal KES 52,500.00. Ref: COOP654321',
  },
];

const SMSIngestion = () => {
  const [phone, setPhone] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useDocumentTitle('SMS Ingestion');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setSubmitting(true);
    try {
      const response = await api.post('/sms/process', { from: phone, body });
      setResult(response.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to process SMS'));
    } finally {
      setSubmitting(false);
    }
  };

  const applySample = (sample: (typeof sampleSMS)[0]) => {
    setPhone(sample.phone);
    setBody(sample.body);
    setResult(null);
    setError('');
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">SMS Ingestion</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manually submit SMS messages for parsing and transaction creation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number (From)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254712345678"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SMS Body
                </label>
                <textarea
                  required
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Paste the SMS message here..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Processing...' : 'Process SMS'}
              </button>
            </form>

            {/* Result */}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}
            {result && (() => {
              const tx = result.transaction as Record<string, unknown> | undefined;
              const isDuplicate = result.isDuplicate as boolean;
              return (
                <div className={clsx(
                  'mt-4 p-4 rounded-xl border',
                  isDuplicate
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-emerald-50 border-emerald-200'
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    {isDuplicate ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    )}
                    <h3 className={clsx(
                      'text-sm font-semibold',
                      isDuplicate ? 'text-amber-800' : 'text-emerald-800'
                    )}>
                      {isDuplicate
                        ? 'Duplicate Transaction — Already Recorded'
                        : 'Transaction Created Successfully'}
                    </h3>
                  </div>
                  {tx && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        {tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER' || tx.type === 'FEE' ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full text-xs font-semibold',
                          tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER' || tx.type === 'FEE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        )}>
                          {tx.type as string}
                        </span>
                        <span className="text-xs text-slate-500">via {tx.bankProvider as string}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs">Amount</p>
                          <p className={clsx('font-bold',
                            tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER' || tx.type === 'FEE'
                              ? 'text-red-600'
                              : 'text-emerald-600'
                          )}>
                            {tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER' || tx.type === 'FEE' ? '-' : '+'} KES {Number(tx.amount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">New Balance</p>
                          <p className="font-bold text-slate-800">KES {Number(tx.balance).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Reference</p>
                          <p className="font-medium text-slate-700">{tx.reference as string}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Date</p>
                          <p className="font-medium text-slate-700">
                            {new Date(tx.transactionDate as string).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/transactions')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    View Transactions
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Sample templates */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Sample Templates
            </h2>
            <div className="space-y-3">
              {sampleSMS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applySample(sample)}
                  className={clsx(
                    'w-full text-left p-3 rounded-xl border transition-colors',
                    'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">
                      {sample.label}
                    </span>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {sample.body}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SMSIngestion;
