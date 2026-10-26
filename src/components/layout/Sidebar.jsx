import React from 'react';
import {
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Scan,
  Crosshair,
  Activity,
  User,
  Radio
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({
  activeTab,
  onSelectTab,
  onOpenRosModal,
  rosStatus
}) {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard Overview' },
    { id: 'map', icon: MapIcon, label: 'Facility 3D Map' },
    { id: 'waypoints', icon: MapPin, label: 'Waypoints & Mission' },
    { id: 'geofence', icon: Scan, label: 'Geofence Safety Zones' },
    { id: 'sensors', icon: Crosshair, label: 'Sensor Calibration' },
    { id: 'telemetry', icon: Activity, label: 'Telemetry Analytics' }
  ];

  return (
    <aside className="sidebar-container" aria-label="Main Navigation">
      {/* ERIC Robotics Brand Logo */}
      <div className="brand-header">
        <div className="brand-title">ERIC</div>
        <div className="brand-subtitle">ROBOTICS</div>
      </div>

      {/* Navigation Icons */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-button ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              aria-label={item.label}
              aria-pressed={isActive}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              {isActive && <span className="active-pip" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        {/* ROS Connection Indicator / Button */}
        <button
          className={`nav-button ros-button ${rosStatus === 'CONNECTED' ? 'ros-connected' : ''}`}
          onClick={onOpenRosModal}
          title={`ROS Bridge (${rosStatus})`}
          aria-label="ROS Bridge Connection"
        >
          <Radio size={20} />
          <span className={`status-dot ${rosStatus.toLowerCase()}`} />
        </button>

        {/* User Profile */}
        <button
          className="nav-button profile-button"
          onClick={() => onSelectTab('profile')}
          title="Operator Profile"
          aria-label="Operator Profile"
        >
          <User size={22} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}

