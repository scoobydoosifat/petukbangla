import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('requires an explicit confirmation', () => {
    const confirm = vi.fn();
    render(<ConfirmDialog open title="পিন যোগ করবেন?" message="Review first" confirmLabel="হ্যাঁ" onConfirm={confirm} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'হ্যাঁ' }));
    expect(confirm).toHaveBeenCalledOnce();
  });

  it('locks both decisions while loading', () => {
    render(<ConfirmDialog open loading title="Deleting" message="Please wait" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('button', { name: 'ফিরে যাই' })).toBeDisabled();
  });

  it('shows an action error inside the active confirmation', () => {
    render(<ConfirmDialog open error="পিনটি মুছতে সমস্যা হয়েছে" title="Deleting" message="Please wait" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('পিনটি মুছতে সমস্যা হয়েছে');
  });
});
