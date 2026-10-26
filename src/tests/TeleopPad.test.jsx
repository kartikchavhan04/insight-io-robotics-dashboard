import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TeleopPad from '../components/dashboard/TeleopPad';

describe('TeleopPad Component', () => {
  it('renders all 4 directional buttons and center hub', () => {
    const onDriveMock = vi.fn();
    render(<TeleopPad onDrive={onDriveMock} />);

    expect(screen.getByLabelText('Drive Forward')).toBeInTheDocument();
    expect(screen.getByLabelText('Drive Backward')).toBeInTheDocument();
    expect(screen.getByLabelText('Turn Left')).toBeInTheDocument();
    expect(screen.getByLabelText('Turn Right')).toBeInTheDocument();
    expect(screen.getByText('key')).toBeInTheDocument();
  });

  it('triggers forward and stop callbacks on mouse down and up', () => {
    const onDriveMock = vi.fn();
    render(<TeleopPad onDrive={onDriveMock} linearSpeed={0.8} angularSpeed={1.0} />);

    const forwardBtn = screen.getByLabelText('Drive Forward');
    fireEvent.mouseDown(forwardBtn);
    expect(onDriveMock).toHaveBeenCalledWith(0.8, 0);

    fireEvent.mouseUp(forwardBtn);
    expect(onDriveMock).toHaveBeenCalledWith(0, 0);
  });

  it('triggers left and stop callbacks on keydown and keyup', () => {
    const onDriveMock = vi.fn();
    render(<TeleopPad onDrive={onDriveMock} linearSpeed={0.8} angularSpeed={1.0} />);

    fireEvent.keyDown(window, { key: 'a' });
    expect(onDriveMock).toHaveBeenCalledWith(0, 1.0);

    fireEvent.keyUp(window, { key: 'a' });
    expect(onDriveMock).toHaveBeenCalledWith(0, 0);
  });

  it('disables buttons when disabled prop is true', () => {
    const onDriveMock = vi.fn();
    render(<TeleopPad onDrive={onDriveMock} disabled={true} />);

    const forwardBtn = screen.getByLabelText('Drive Forward');
    expect(forwardBtn).toBeDisabled();

    fireEvent.mouseDown(forwardBtn);
    expect(onDriveMock).not.toHaveBeenCalled();
  });
});

