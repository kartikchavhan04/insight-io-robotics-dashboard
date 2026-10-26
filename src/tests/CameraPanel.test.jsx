import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CameraPanel from '../components/camera/CameraPanel';

describe('CameraPanel Component', () => {
  it('renders camera stream with OSD telemetry in main view', () => {
    render(<CameraPanel isPip={false} onSwapView={vi.fn()} />);

    expect(screen.getByLabelText('Camera Video Stream')).toBeInTheDocument();
    expect(screen.getByText('FEED')).toBeInTheDocument();
    expect(screen.getByText('1920x1080')).toBeInTheDocument();
    expect(screen.getByText('30 FPS')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Camera Stream')).toBeInTheDocument();
  });

  it('renders PiP hover prompt when isPip is true', () => {
    render(<CameraPanel isPip={true} onSwapView={vi.fn()} />);

    expect(screen.getByText('Click to Expand Camera View')).toBeInTheDocument();
  });
});

