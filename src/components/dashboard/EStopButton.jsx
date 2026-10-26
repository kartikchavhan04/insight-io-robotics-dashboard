import React from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';
import './EStopButton.css';

export default function EStopButton({ isEStopActive, onToggleEStop }) {
  return (
    <div className="estop-container" aria-label="Emergency Stop System">
      <button
        className={`estop-outer-ring ${isEStopActive ? 'estop-engaged' : ''}`}
        onClick={onToggleEStop}
        title={isEStopActive ? 'Reset Emergency Stop' : 'Engage Emergency Stop'}
        aria-label={isEStopActive ? 'Reset Emergency Stop' : 'Engage Emergency Stop'}
        aria-pressed={isEStopActive}
      >
        {/* Curved Bezel SVG Text */}
        <svg className="estop-bezel-svg" viewBox="0 0 100 100">
          <defs>
            <path
              id="top-arc"
              d="M 16,50 A 34,34 0 0,1 84,50"
              fill="none"
            />
            <path
              id="bottom-arc"
              d="M 84,50 A 34,34 0 0,1 16,50"
              fill="none"
            />
          </defs>
          <text className="bezel-text" textAnchor="middle">
            <textPath href="#top-arc" startOffset="50%">
              EMERGENCY
            </textPath>
          </text>
          <text className="bezel-text" textAnchor="middle">
            <textPath href="#bottom-arc" startOffset="50%">
              STOP
            </textPath>
          </text>
        </svg>

        {/* Center Mushroom Red Button */}
        <div className="estop-inner-button">
          {isEStopActive ? (
            <AlertTriangle size={28} className="estop-icon alert-spin" />
          ) : (
            <RotateCw size={28} className="estop-icon" />
          )}
        </div>
      </button>

      {isEStopActive && (
        <div className="estop-warning-tag">
          E-STOP ENGAGED
        </div>
      )}
    </div>
  );
}

