import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '../../components/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No Data" description="There is nothing to show here." />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('There is nothing to show here.')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Empty"
        description="Nothing yet."
        action={{ label: 'Add Item', onClick }}
      />
    );
    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState title="Empty" description="Nothing yet." />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
