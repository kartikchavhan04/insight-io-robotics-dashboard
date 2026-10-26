import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('Insight.IO Full Dashboard Application', () => {
  it('renders sidebar branding and navigation icons', () => {
    render(<App />);

    expect(screen.getByText('ERIC')).toBeInTheDocument();
    expect(screen.getByText('ROBOTICS')).toBeInTheDocument();
    expect(screen.getByLabelText('Main Navigation')).toBeInTheDocument();
  });

  it('renders top HUD with mission status, battery, failsafe', () => {
    render(<App />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('On Mission 1234')).toBeInTheDocument();
    expect(screen.getByText('QUICK GOAL')).toBeInTheDocument();
    expect(screen.getByText('INITIATE')).toBeInTheDocument();
    expect(screen.getByText('Failsafe')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('toggles mode between AUTO and MANUAL', () => {
    render(<App />);

    const manualBtn = screen.getByRole('button', { name: 'MANUAL' });
    fireEvent.click(manualBtn);

    expect(manualBtn).toHaveClass('mode-active');
  });

  it('opens and closes Quick Goal modal', () => {
    render(<App />);

    const quickGoalBtn = screen.getByRole('button', { name: 'Set Quick Navigation Target' });
    fireEvent.click(quickGoalBtn);

    expect(screen.getByText('Quick Goal Navigation')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close Modal');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Quick Goal Navigation')).not.toBeInTheDocument();
  });
});

