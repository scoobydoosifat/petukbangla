import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LoadingButton from './LoadingButton';

describe('LoadingButton duplicate-submit guard', () => {
  it('disables the button while a request is running', () => {
    const click = vi.fn();
    render(<LoadingButton loading onClick={click}>Publish</LoadingButton>);
    fireEvent.click(screen.getByRole('button', { name: /publish/i }));
    expect(click).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('accepts one click while idle', () => {
    const click = vi.fn();
    render(<LoadingButton loading={false} onClick={click}>Publish</LoadingButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(click).toHaveBeenCalledTimes(1);
  });
});
