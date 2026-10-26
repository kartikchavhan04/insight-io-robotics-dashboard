import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RobotSimulator, DEFAULT_WAYPOINTS } from '../services/robotSimulator';

describe('RobotSimulator Engine', () => {
  let sim;

  beforeEach(() => {
    sim = new RobotSimulator();
  });

  afterEach(() => {
    sim.stop();
  });

  it('initializes with default telemetry and mode', () => {
    expect(sim.state.mode).toBe('AUTO');
    expect(sim.state.battery).toBe(100);
    expect(sim.state.failsafe).toBe('Okay');
    expect(sim.state.isEStop).toBe(false);
    expect(sim.state.waypoints.length).toBe(DEFAULT_WAYPOINTS.length);
  });

  it('triggers emergency stop and freezes velocities', () => {
    sim.setTeleopVelocity(1.0, 0.5);
    sim.triggerEStop();

    expect(sim.state.isEStop).toBe(true);
    expect(sim.state.failsafe).toBe('Triggered');
    expect(sim.state.missionStatus).toBe('EMERGENCY STOP');
    expect(sim.state.linearVelocity).toBe(0);
    expect(sim.state.angularVelocity).toBe(0);

    // Reset E-stop
    sim.triggerEStop();
    expect(sim.state.isEStop).toBe(false);
    expect(sim.state.failsafe).toBe('Okay');
  });

  it('toggles mission pause state', () => {
    expect(sim.state.isMissionPaused).toBe(false);
    sim.toggleMissionPause();
    expect(sim.state.isMissionPaused).toBe(true);
    expect(sim.state.missionStatus).toBe('Mission Paused');

    sim.toggleMissionPause();
    expect(sim.state.isMissionPaused).toBe(false);
    expect(sim.state.missionStatus).toBe('On Mission 1234');
  });

  it('sets quick goal navigation target', () => {
    sim.setQuickGoal(12, -15, 'Station B');
    expect(sim.state.targetGoal).toEqual({ x: 12, y: -15, name: 'Station B' });
    expect(sim.state.mode).toBe('AUTO');
    expect(sim.state.missionStatus).toBe('Navigating to Station B');
  });
});

