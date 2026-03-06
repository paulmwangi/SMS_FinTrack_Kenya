import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../../components/StatCard';

describe('StatCard', () => {
  it('renders title and value correctly', () => {
    render(<StatCard title="Total Balance" value="KES 50,000" icon={<span>💰</span>} />);
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('KES 50,000')).toBeInTheDocument();
  });

  it('renders positive change indicator', () => {
    render(
      <StatCard
        title="Income"
        value="KES 10,000"
        change="+12%"
        changeType="positive"
        icon={<span>📈</span>}
      />
    );
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toHaveClass('text-emerald-600');
  });

  it('renders negative change indicator', () => {
    render(
      <StatCard
        title="Expenses"
        value="KES 5,000"
        change="-8%"
        changeType="negative"
        icon={<span>📉</span>}
      />
    );
    expect(screen.getByText('-8%')).toBeInTheDocument();
    expect(screen.getByText('-8%')).toHaveClass('text-red-600');
  });

  it('renders icon', () => {
    render(
      <StatCard title="Transactions" value="42" icon={<span data-testid="icon">🔄</span>} />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
