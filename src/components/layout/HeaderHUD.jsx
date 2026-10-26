import React from 'react';
import {
  Pause,
  Play,
  ArrowRight,
  BatteryCharging,
  Wifi,
  Layers,
  Video
} from 'lucide-react';
import './HeaderHUD.css';

export default function HeaderHUD({
  robotState,
  onTogglePause,
  onSetMode,
  onQuickGoalClick,
  onInitiateClick,
  activeView,
  onToggleViewMode
}) {
  const {
    missionStatus,
    isMissionPaused,
    battery,
    signalStrength,
    failsafe,
    system,
    mode,
    isEStop
  } = robotState;

  return (
    <header className="header-hud-container" aria-label="Dashboard Header and HUD">
      {/* LEFT SECTION: Mission Status & Quick Goal */}
      <div className="hud-left-group">
        <div className="hud-pill status-pill">
          <span className="status-label">Status</span>
          <span className={`status-text ${isEStop ? 'estop-active' : ''}`}>
            {missionStatus}
          </span>
          <button
            className="pill-circle-btn"
            onClick={onTogglePause}
            title={isMissionPaused ? 'Resume Mission' : 'Pause Mission'}
            aria-label={isMissionPaused ? 'Resume Mission' : 'Pause Mission'}
            disabled={isEStop}
          >
            {isMissionPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
          </button>
        </div>

        <button
          className="hud-pill action-pill quick-goal-btn"
          onClick={onQuickGoalClick}
          title="Set Quick Navigation Target"
          aria-label="Set Quick Navigation Target"
          disabled={isEStop}
        >
          <span className="action-text">QUICK GOAL</span>
          <span className="pill-circle-btn">
            <ArrowRight size={13} />
          </span>
        </button>
      </div>

      {/* CENTER SECTION: Floating Telemetry HUD & View Mode Toggle */}
      <div className="hud-center-group">
        <div className="telemetry-bar" role="status" aria-label="Robot Telemetry Status">
          {/* Battery */}
          <div className="telemetry-item" title={`Battery: ${battery}%`}>
            <span className="telemetry-value">{Math.round(battery)}%</span>
            <div className="battery-icon-wrapper">
              <BatteryCharging size={16} className="battery-icon" />
              <div
                className="battery-fill"
                style={{ width: `${Math.max(10, Math.min(100, battery))}%` }}
              />
            </div>
          </div>

          {/* Signal */}
          <div className="telemetry-item" title="Wireless Link: 5.8 GHz WiFi / 5G">
            <Wifi size={14} className="signal-icon" />
            <span className="telemetry-label">{signalStrength}</span>
          </div>

          {/* Failsafe */}
          <div className="telemetry-item" title={`Failsafe Status: ${failsafe}`}>
            <span className="telemetry-label">Failsafe</span>
            <span className="telemetry-value">{failsafe}</span>
            <span
              className={`telemetry-dot ${
                failsafe === 'Okay' ? 'dot-green' : 'dot-red'
              }`}
            />
          </div>

          {/* System */}
          <div className="telemetry-item" title={`System Status: ${system}`}>
            <span className="telemetry-label">System</span>
            <span className="telemetry-value">{system}</span>
            <span
              className={`telemetry-dot ${
                system === 'Okay' ? 'dot-green' : 'dot-yellow'
              }`}
            />
          </div>
        </div>

        {/* Primary View Mode Switcher Pill */}
        <button
          className="view-mode-pill"
          onClick={onToggleViewMode}
          title={`Click to switch to ${activeView === 'map' ? 'Camera' : 'Map'} View`}
          aria-label={`Switch View: Currently ${activeView === 'map' ? 'Map' : 'Camera'} View`}
        >
          {activeView === 'map' ? (
            <>
              <Layers size={13} className="view-mode-icon" />
              <span>Map View</span>
            </>
          ) : (
            <>
              <Video size={13} className="view-mode-icon" />
              <span>Camera View</span>
            </>
          )}
        </button>
      </div>

      {/* RIGHT SECTION: Mode Selector & Initiate */}
      <div className="hud-right-group">
        <div className="hud-pill mode-selector-pill">
          <span className="mode-title">MODE</span>
          <div className="mode-toggle-group">
            <button
              className={`mode-btn ${mode === 'AUTO' ? 'mode-active' : ''}`}
              onClick={() => onSetMode('AUTO')}
              aria-pressed={mode === 'AUTO'}
            >
              AUTO
            </button>
            <button
              className={`mode-btn ${mode === 'MANUAL' ? 'mode-active' : ''}`}
              onClick={() => onSetMode('MANUAL')}
              aria-pressed={mode === 'MANUAL'}
            >
              MANUAL
            </button>
          </div>
        </div>

        <button
          className="hud-pill action-pill initiate-btn"
          onClick={onInitiateClick}
          title="Initiate Autonomous Route"
          aria-label="Initiate Autonomous Route"
          disabled={isEStop}
        >
          <span className="action-text">INITIATE</span>
          <span className="pill-circle-btn">
            <ArrowRight size={13} />
          </span>
        </button>
      </div>
    </header>
  );
}

