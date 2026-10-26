import React, { useState } from 'react';
import { Radio, X, Check, Unplug } from 'lucide-react';
import { rosService } from '../../services/rosService';
import './RosConnectionModal.css';

export default function RosConnectionModal({ isOpen, onClose, rosStatus }) {
  const [rosUrl, setRosUrl] = useState('ws://localhost:9090');

  if (!isOpen) return null;

  const handleConnect = (e) => {
    e.preventDefault();
    rosService.connect(rosUrl);
  };

  const handleDisconnect = () => {
    rosService.disconnect();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Radio size={18} className="modal-title-icon" />
            <h3>ROS Bridge Integration</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={18} />
          </button>
        </div>

        <p className="modal-desc">
          Connect to a ROS1/ROS2 web bridge server (via rosbridge_suite) to stream real LiDAR scans, odometry, and send teleoperation Twist commands.
        </p>

        {/* Current Connection Status */}
        <div className={`ros-status-card status-${rosStatus.toLowerCase()}`}>
          <div className="status-indicator-dot" />
          <div className="status-text-info">
            <span className="status-title">Status: {rosStatus}</span>
            <span className="status-sub">
              {rosStatus === 'CONNECTED'
                ? `Connected to ${rosUrl}`
                : rosStatus === 'CONNECTING'
                ? 'Attempting WebSocket handshake...'
                : 'Using Built-in High-Fidelity Simulator'}
            </span>
          </div>
        </div>

        {/* Connection Form */}
        <form onSubmit={handleConnect} className="ros-form">
          <div className="input-field">
            <label htmlFor="ros-url">ROS Bridge WebSocket URL</label>
            <input
              id="ros-url"
              type="text"
              value={rosUrl}
              onChange={(e) => setRosUrl(e.target.value)}
              placeholder="ws://localhost:9090"
              disabled={rosStatus === 'CONNECTED'}
            />
          </div>

          <div className="ros-btn-row">
            {rosStatus === 'CONNECTED' ? (
              <button
                type="button"
                className="ros-disconnect-btn"
                onClick={handleDisconnect}
              >
                <Unplug size={14} /> Disconnect ROS
              </button>
            ) : (
              <button
                type="submit"
                className="ros-connect-btn"
                disabled={rosStatus === 'CONNECTING'}
              >
                <Check size={14} /> {rosStatus === 'CONNECTING' ? 'Connecting...' : 'Connect to Bridge'}
              </button>
            )}
          </div>
        </form>

        {/* Topic Info */}
        <div className="ros-topics-info">
          <span className="preset-section-title">Supported Topics</span>
          <ul className="topics-list">
            <li><code>/cmd_vel</code> (geometry_msgs/Twist) — Teleoperation jog velocity</li>
            <li><code>/odom</code> (nav_msgs/Odometry) — Robot position & heading</li>
            <li><code>/battery_state</code> (sensor_msgs/BatteryState) — Charge % & voltage</li>
            <li><code>/scan</code> (sensor_msgs/LaserScan) — 2D LiDAR range data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
