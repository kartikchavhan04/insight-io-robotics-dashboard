import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import EStopButton from '../components/dashboard/EStopButton';

describe('EStopButton Component', () => {
  it('renders correctly in inactive state', () => {
    const onToggleMock = vi.fn();
    render(<EStopButton isEStopActive={false} onToggleEStop={onToggleMock} />);

    const button = screen.getByLabelText('Engage Emergency Stop');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByText('E-STOP ENGAGED')).not.toBeInTheDocument();
  });

  it('triggers onToggleEStop when clicked', () => {
    const onToggleMock = vi.fn();
    render(<EStopButton isEStopActive={false} onToggleEStop={onToggleMock} />);

    const button = screen.getByLabelText('Engage Emergency Stop');
    fireEvent.click(button);
    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });

  it('displays warning badge and active state when isEStopActive is true', () => {
    const onToggleMock = vi.fn();
    render(<EStopButton isEStopActive={true} onToggleEStop={onToggleMock} />);

    const button = screen.getByLabelText('Reset Emergency Stop');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('E-STOP ENGAGED')).toBeInTheDocument();
  });
});

