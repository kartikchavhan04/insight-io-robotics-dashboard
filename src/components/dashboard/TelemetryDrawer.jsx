import React from 'react';
import { Activity, X, Gauge, Battery, Wifi, ShieldAlert } from 'lucide-react';
import './TelemetryDrawer.css';

export default function TelemetryDrawer({ isOpen, onClose, robotState }) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Activity size={18} className="drawer-icon" />
            <h3>Live Telemetry Analytics</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Drawer">
            <X size={18} />
          </button>
        </div>

        <div className="telemetry-grid">
          {/* Kinematics */}
          <div className="stat-card">
            <div className="stat-card-header">
              <Gauge size={16} />
              <span>Kinematics</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Linear Vel</span>
              <span className="stat-value">{robotState.linearVelocity.toFixed(2)} m/s</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Angular Vel</span>
              <span className="stat-value">{robotState.angularVelocity.toFixed(2)} rad/s</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Heading</span>
              <span className="stat-value">{((robotState.heading * 180) / Math.PI).toFixed(1)}°</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Position (X, Y)</span>
              <span className="stat-value">{robotState.x.toFixed(2)}m, {robotState.y.toFixed(2)}m</span>
            </div>
          </div>

          {/* Battery & Power */}
          <div className="stat-card">
            <div className="stat-card-header">
              <Battery size={16} />
              <span>Power System</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Charge Level</span>
              <span className="stat-value">{Math.round(robotState.battery)}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Voltage</span>
              <span className="stat-value">{robotState.batteryVoltage} V</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Cell Health</span>
              <span className="stat-value text-green">Optimal (99%)</span>
            </div>
          </div>

          {/* Comms & Failsafe */}
          <div className="stat-card">
            <div className="stat-card-header">
              <Wifi size={16} />
              <span>Connectivity</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Link Quality</span>
              <span className="stat-value text-green">{robotState.signalStrength}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Signal RSSI</span>
              <span className="stat-value">{robotState.signalDbm} dBm</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Latency</span>
              <span className="stat-value">14 ms</span>
            </div>
          </div>

          {/* Safety & Compute */}
          <div className="stat-card">
            <div className="stat-card-header">
              <ShieldAlert size={16} />
              <span>Safety & Compute</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Failsafe Loop</span>
              <span className={`stat-value ${robotState.failsafe === 'Okay' ? 'text-green' : 'text-red'}`}>
                {robotState.failsafe}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">CPU Temp</span>
              <span className="stat-value">42.8 °C</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">E-Stop Status</span>
              <span className={`stat-value ${robotState.isEStop ? 'text-red' : 'text-green'}`}>
                {robotState.isEStop ? 'ACTIVATED' : 'DISENGAGED'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
