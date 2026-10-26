/**
 * Robot State & Kinematics Simulator for Insight.IO
 * Provides realistic odometry, autonomous path following, battery modeling,
 * teleoperation velocity integration, and event subscriptions.
 */

// Warehouse reference waypoints (matching reference map coordinates)
export const DEFAULT_WAYPOINTS = [
  { id: 'wp-1', name: 'Inspection Bay', x: 0, y: -5, heading: 0 },
  { id: 'wp-2', name: 'Central Corridor', x: 0, y: 10, heading: Math.PI / 2 },
  { id: 'wp-3', name: 'Work Zone Alpha', x: -8, y: 15, heading: Math.PI },
  { id: 'wp-4', name: 'Packaging Rack', x: -6, y: 25, heading: Math.PI / 2 },
  { id: 'wp-5', name: 'Main Hall Crossing', x: 2, y: 20, heading: 0 },
  { id: 'wp-6', name: 'Lab Corridor', x: 8, y: 5, heading: -Math.PI / 2 },
  { id: 'wp-7', name: 'Docking Station', x: 0, y: -28, heading: -Math.PI / 2 }
];

export class RobotSimulator {
  constructor() {
    this.state = {
      // Pose
      x: 0,
      y: -2,
      z: 0.15,
      heading: 0, // radians

      // Dynamics
      linearVelocity: 0,
      angularVelocity: 0,
      targetLinearVel: 0,
      targetAngularVel: 0,
      maxLinearVel: 1.2, // m/s
      maxAngularVel: 1.5, // rad/s

      // System Telemetry
      battery: 100,
      batteryVoltage: 25.4,
      signalStrength: 'Strong',
      signalDbm: -54,
      failsafe: 'Okay',
      system: 'Okay',

      // Operational Mode
      mode: 'AUTO', // 'AUTO' | 'MANUAL'
      missionStatus: 'On Mission 1234',
      isMissionPaused: false,
      isEStop: false,

      // Navigation Targets
      currentWaypointIndex: 1,
      waypoints: [...DEFAULT_WAYPOINTS],
      targetGoal: null,
      pathHistory: [{ x: 0, y: -2 }],

      // Sensor telemetry
      lidarScanAngle: 0,
      obstacleDistance: 3.4
    };

    this.listeners = new Set();
    this.intervalId = null;
    this.lastTimestamp = Date.now();
  }

  start() {
    if (this.intervalId) return;
    this.lastTimestamp = Date.now();
    this.intervalId = setInterval(() => this.update(), 50); // 20 Hz update loop
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = { ...this.state };
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('RobotSimulator subscriber error:', err);
      }
    }
  }

  update() {
    const now = Date.now();
    const dt = Math.min((now - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = now;

    // LiDAR radar sweep rotation
    this.state.lidarScanAngle = (this.state.lidarScanAngle + dt * 2.5) % (2 * Math.PI);

    // If E-Stop active, freeze motion
    if (this.state.isEStop) {
      this.state.linearVelocity = 0;
      this.state.angularVelocity = 0;
      this.state.targetLinearVel = 0;
      this.state.targetAngularVel = 0;
      this.notify();
      return;
    }

    // Gradual battery discharge simulation
    if (this.state.battery > 5) {
      this.state.battery = Math.max(5, +(this.state.battery - dt * 0.005).toFixed(2));
      this.state.batteryVoltage = +(24.0 + (this.state.battery / 100) * 1.6).toFixed(1);
    }

    if (this.state.mode === 'MANUAL') {
      // Smooth manual teleoperation velocity integration
      const accel = 3.0; // m/s^2
      this.state.linearVelocity += (this.state.targetLinearVel - this.state.linearVelocity) * Math.min(1, accel * dt);
      this.state.angularVelocity += (this.state.targetAngularVel - this.state.angularVelocity) * Math.min(1, accel * dt);

      this.state.heading += this.state.angularVelocity * dt;
      this.state.x += Math.cos(this.state.heading) * this.state.linearVelocity * dt;
      this.state.y += Math.sin(this.state.heading) * this.state.linearVelocity * dt;

    } else if (this.state.mode === 'AUTO' && !this.state.isMissionPaused) {
      // Autonomous waypoint tracking
      const target = this.state.targetGoal || this.state.waypoints[this.state.currentWaypointIndex];
      if (target) {
        const dx = target.x - this.state.x;
        const dy = target.y - this.state.y;
        const distance = Math.hypot(dx, dy);
        const desiredHeading = Math.atan2(dy, dx);

        if (distance > 0.4) {
          // Angle difference wrapped to [-PI, PI]
          let angleDiff = desiredHeading - this.state.heading;
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

          // Pure pursuit steering
          this.state.angularVelocity = Math.max(-1.2, Math.min(1.2, angleDiff * 2.0));
          this.state.linearVelocity = Math.abs(angleDiff) > 0.8 ? 0.2 : Math.min(0.8, distance * 0.6);

          this.state.heading += this.state.angularVelocity * dt;
          this.state.x += Math.cos(this.state.heading) * this.state.linearVelocity * dt;
          this.state.y += Math.sin(this.state.heading) * this.state.linearVelocity * dt;
        } else {
          // Target reached
          if (this.state.targetGoal) {
            this.state.targetGoal = null;
            this.state.missionStatus = 'Goal Reached';
          } else {
            this.state.currentWaypointIndex = (this.state.currentWaypointIndex + 1) % this.state.waypoints.length;
          }
          this.state.linearVelocity = 0;
          this.state.angularVelocity = 0;
        }
      }
    } else {
      this.state.linearVelocity = 0;
      this.state.angularVelocity = 0;
    }

    // Keep path history (capped at 200 points)
    const lastPoint = this.state.pathHistory[this.state.pathHistory.length - 1];
    if (!lastPoint || Math.hypot(lastPoint.x - this.state.x, lastPoint.y - this.state.y) > 0.3) {
      this.state.pathHistory.push({ x: +this.state.x.toFixed(2), y: +this.state.y.toFixed(2) });
      if (this.state.pathHistory.length > 250) {
        this.state.pathHistory.shift();
      }
    }

    this.notify();
  }

  // User Actions
  toggleMissionPause() {
    this.state.isMissionPaused = !this.state.isMissionPaused;
    this.state.missionStatus = this.state.isMissionPaused ? 'Mission Paused' : 'On Mission 1234';
    this.notify();
  }

  setMode(mode) {
    if (mode === 'AUTO' || mode === 'MANUAL') {
      this.state.mode = mode;
      this.state.targetLinearVel = 0;
      this.state.targetAngularVel = 0;
      if (mode === 'MANUAL') {
        this.state.missionStatus = 'Manual Teleop Active';
      } else {
        this.state.missionStatus = this.state.isMissionPaused ? 'Mission Paused' : 'On Mission 1234';
      }
      this.notify();
    }
  }

  triggerEStop() {
    this.state.isEStop = !this.state.isEStop;
    if (this.state.isEStop) {
      this.state.failsafe = 'Triggered';
      this.state.missionStatus = 'EMERGENCY STOP';
      this.state.linearVelocity = 0;
      this.state.angularVelocity = 0;
      this.state.targetLinearVel = 0;
      this.state.targetAngularVel = 0;
    } else {
      this.state.failsafe = 'Okay';
      this.state.missionStatus = this.state.mode === 'AUTO' ? 'On Mission 1234' : 'Manual Teleop Active';
    }
    this.notify();
  }

  setTeleopVelocity(linear, angular) {
    if (this.state.isEStop) return;
    this.state.targetLinearVel = Math.max(-this.state.maxLinearVel, Math.min(this.state.maxLinearVel, linear));
    this.state.targetAngularVel = Math.max(-this.state.maxAngularVel, Math.min(this.state.maxAngularVel, angular));
    this.notify();
  }

  setQuickGoal(x, y, name = 'Quick Target') {
    if (this.state.isEStop) return;
    this.state.targetGoal = { x, y, name };
    this.state.mode = 'AUTO';
    this.state.isMissionPaused = false;
    this.state.missionStatus = `Navigating to ${name}`;
    this.notify();
  }

  initiateMission() {
    if (this.state.isEStop) return;
    this.state.mode = 'AUTO';
    this.state.isMissionPaused = false;
    this.state.currentWaypointIndex = 0;
    this.state.missionStatus = 'On Mission 1234';
    this.notify();
  }
}

// Global singleton instance
export const robotSimulator = new RobotSimulator();
robotSimulator.start();

