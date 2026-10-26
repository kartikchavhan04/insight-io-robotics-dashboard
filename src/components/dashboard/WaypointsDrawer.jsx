import React from 'react';
import { MapPin, X, Navigation } from 'lucide-react';
import './WaypointsDrawer.css';

export default function WaypointsDrawer({ isOpen, onClose, robotState, onSelectWaypoint }) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <MapPin size={18} className="drawer-icon" />
            <h3>Mission Waypoints</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Drawer">
            <X size={18} />
          </button>
        </div>

        <p className="drawer-desc">
          Current autonomous patrol route waypoints. Click any waypoint to set it as current target.
        </p>

        <div className="waypoints-scroll-list">
          {robotState.waypoints.map((wp, idx) => {
            const isCurrent = robotState.currentWaypointIndex === idx;
            return (
              <button
                key={wp.id}
                className={`waypoint-card-btn ${isCurrent ? 'wp-card-active' : ''}`}
                onClick={() => {
                  onSelectWaypoint(wp.x, wp.y, wp.name);
                  onClose();
                }}
              >
                <div className="wp-badge">{idx + 1}</div>
                <div className="wp-details">
                  <span className="wp-name">{wp.name}</span>
                  <span className="wp-coords">X: {wp.x}m, Y: {wp.y}m</span>
                </div>
                {isCurrent ? (
                  <span className="wp-status-tag">ACTIVE TARGET</span>
                ) : (
                  <Navigation size={14} className="wp-arrow" />
                )}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
