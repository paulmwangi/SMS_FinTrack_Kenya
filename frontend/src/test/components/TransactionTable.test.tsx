import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionTable from '../../components/TransactionTable';
import type { Transaction } from '../../components/TransactionTable';

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'DEPOSIT',
    amount: 5000,
    balance: 15000,
    description: 'Salary payment',
    bankProvider: 'MPESA',
    transactionDate: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    type: 'WITHDRAWAL',
    amount: 2000,
    balance: 13000,
    description: 'ATM withdrawal',
    bankProvider: 'KCB',
    transactionDate: '2024-01-16T14:30:00Z',
  },
];

describe('TransactionTable', () => {
  it('shows loading skeleton when loading is true', () => {
    const { container } = render(<TransactionTable transactions={[]} loading={true} />);
    const skeletonRows = container.querySelectorAll('tr.animate-pulse');
    expect(skeletonRows.length).toBe(5);
  });

  it('shows empty state when no transactions', () => {
    render(<TransactionTable transactions={[]} />);
    expect(screen.getByText('No transactions found')).toBeInTheDocument();
    expect(
      screen.getByText('Transactions will appear here once SMS messages are processed.')
    ).toBeInTheDocument();
  });

  it('renders transactions correctly', () => {
    render(<TransactionTable transactions={sampleTransactions} />);
    expect(screen.getByText('Salary payment')).toBeInTheDocument();
    expect(screen.getByText('ATM withdrawal')).toBeInTheDocument();
    expect(screen.getByText('MPESA')).toBeInTheDocument();
    expect(screen.getByText('KCB')).toBeInTheDocument();
  });

  it('shows correct type badges (DEPOSIT = green, WITHDRAWAL = red)', () => {
    render(<TransactionTable transactions={sampleTransactions} />);
    const depositBadge = screen.getByText('DEPOSIT');
    const withdrawalBadge = screen.getByText('WITHDRAWAL');
    expect(depositBadge).toHaveClass('bg-emerald-100', 'text-emerald-700');
    expect(withdrawalBadge).toHaveClass('bg-red-100', 'text-red-700');
  });
});
