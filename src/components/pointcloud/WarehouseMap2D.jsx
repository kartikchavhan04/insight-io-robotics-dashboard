import React, { useRef } from 'react';
import { Wifi, Target } from 'lucide-react';
import './WarehouseMap2D.css';

export default function WarehouseMap2D({
  robotState,
  onMapClick,
  zoomLevel = 1.0,
  isPip = false,
  onSwapView,
  onToggle3DMode
}) {
  const containerRef = useRef(null);

  // Convert simulated coordinates to pixel percentages
  // X: -25 to +25 -> 10% to 90%
  // Y: -35 to +35 -> 90% to 10% (inverted for screen Y)
  const normX = ((robotState.x + 22) / 44) * 100;
  const normY = ((35 - robotState.y) / 70) * 100;

  const handleContainerClick = (e) => {
    if (isPip) {
      onSwapView?.();
      return;
    }
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const pctX = clickX / rect.width;
    const pctY = clickY / rect.height;
    const worldX = +(pctX * 44 - 22).toFixed(1);
    const worldY = +((1 - pctY) * 70 - 35).toFixed(1);

    onMapClick?.(worldX, worldY);
  };

  return (
    <div
      ref={containerRef}
      className={`warehouse-map-container ${isPip ? 'map-pip' : 'map-main'}`}
      onClick={handleContainerClick}
      title={isPip ? 'Click to switch to Map View' : 'Click anywhere on map to dispatch robot'}
      aria-label="Interactive Facility Map"
    >
      {/* Scaled & Rotated Map Canvas */}
      <div
        className="map-transform-wrapper"
        style={{
          transform: `scale(${zoomLevel}) rotate(-12deg)`
        }}
      >
        {/* Main Warehouse Floor Polygon */}
        <div className="warehouse-floor">
          {/* Black Outer Perimeter SLAM Walls */}
          <div className="wall-boundary-outer" />

          {/* Safety / Working Zones (Soft Pink/Red transparent boxes with labels) */}
          {/* Top Left: Work Zone Alpha */}
          <div className="zone-box zone-work-alpha">
            <span className="zone-label">Work Zone Alpha</span>
          </div>

          {/* Top Center: Packing Area */}
          <div className="zone-box zone-packing">
            <span className="zone-label">Packing Area</span>
          </div>

          {/* Bottom Left: Meeting Room */}
          <div className="zone-box zone-meeting">
            <span className="zone-label">Meeting Room</span>
          </div>

          {/* Right Corridor: Central Lab */}
          <div className="zone-box zone-lab">
            <span className="zone-label">Lab</span>
          </div>

          {/* Obstacle Clusters / SLAM LiDAR Point scatter */}
          <div className="lidar-point-cluster cluster-1" />
          <div className="lidar-point-cluster cluster-2" />
          <div className="lidar-point-cluster cluster-3" />
          <div className="lidar-point-cluster cluster-4" />

          {/* Navigation Waypoint Markers */}
          {robotState.waypoints.map((wp, idx) => {
            const wx = ((wp.x + 22) / 44) * 100;
            const wy = ((35 - wp.y) / 70) * 100;
            const isTarget = robotState.currentWaypointIndex === idx;
            return (
              <div
                key={wp.id}
                className={`waypoint-pin ${isTarget ? 'target-pin' : ''}`}
                style={{ left: `${wx}%`, top: `${wy}%` }}
                title={`${wp.name} (WP ${idx + 1})`}
              >
                <div className="pin-head" />
              </div>
            );
          })}

          {/* Custom Quick Goal Marker if active */}
          {robotState.targetGoal && (
            <div
              className="quick-goal-marker"
              style={{
                left: `${((robotState.targetGoal.x + 22) / 44) * 100}%`,
                top: `${((35 - robotState.targetGoal.y) / 70) * 100}%`
              }}
              title="Active Goal Target"
            >
              <Target size={20} className="goal-icon-pulsing" />
            </div>
          )}

          {/* Breadcrumb Path Trail */}
          <svg className="path-trail-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {robotState.pathHistory.length > 1 && (
              <polyline
                points={robotState.pathHistory
                  .map((p) => {
                    const px = ((p.x + 22) / 44) * 100;
                    const py = ((35 - p.y) / 70) * 100;
                    return `${px.toFixed(2)},${py.toFixed(2)}`;
                  })
                  .join(' ')}
                className="path-polyline"
              />
            )}
          </svg>

          {/* ROBOT AVATAR (AMR Mobile Robot with WiFi antenna) */}
          <div
            className="robot-avatar"
            style={{
              left: `${normX}%`,
              top: `${normY}%`,
              transform: `translate(-50%, -50%) rotate(${robotState.heading}rad)`
            }}
          >
            {/* LiDAR Radar Sweep Cone */}
            <div className="radar-sweep-cone" />

            {/* WiFi Antenna Icon on top */}
            <div className="robot-antenna-wrapper">
              <Wifi size={14} className="robot-wifi-icon" />
            </div>

            {/* Robot Chassis Graphic (Industrial AMR) */}
            <div className="robot-body-chassis">
              <div className="wheel wheel-left-top" />
              <div className="wheel wheel-right-top" />
              <div className="wheel wheel-left-bottom" />
              <div className="wheel wheel-right-bottom" />
              <div className="robot-lidar-center" />
              <div className="robot-forward-bumper" />
            </div>
          </div>
        </div>
      </div>

      {/* PiP Hover Overlay */}
      {isPip && (
        <div className="pip-hover-overlay">
          <span className="pip-hover-label">Click to Expand Map View</span>
        </div>
      )}

      {/* Mode Switcher Badge (2D Plan vs 3D Point Cloud) */}
      {!isPip && (
        <div className="map-view-toggle-badge" onClick={(e) => e.stopPropagation()}>
          <button
            className="map-mode-btn"
            onClick={onToggle3DMode}
            title="Switch to Interactive 3D Three.js Point Cloud"
          >
            Switch to 3D Point Cloud View
          </button>
        </div>
      )}
    </div>
  );
}
