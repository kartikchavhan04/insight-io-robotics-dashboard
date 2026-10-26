import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import './TeleopPad.css';

export default function TeleopPad({
  onDrive,
  disabled = false,
  linearSpeed = 0.8,
  angularSpeed = 1.0
}) {
  const [activeDirection, setActiveDirection] = useState(null);

  const sendCommand = useCallback(
    (direction) => {
      if (disabled) return;
      setActiveDirection(direction);

      switch (direction) {
        case 'forward':
          onDrive(linearSpeed, 0);
          break;
        case 'backward':
          onDrive(-linearSpeed, 0);
          break;
        case 'left':
          onDrive(0, angularSpeed);
          break;
        case 'right':
          onDrive(0, -angularSpeed);
          break;
        case 'stop':
        default:
          onDrive(0, 0);
          setActiveDirection(null);
          break;
      }
    },
    [disabled, linearSpeed, angularSpeed, onDrive]
  );

  // Keyboard shortcut listener for W, A, S, D & Arrow Keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled || e.repeat) return;
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        e.preventDefault();
        sendCommand('forward');
      } else if (key === 's' || key === 'arrowdown') {
        e.preventDefault();
        sendCommand('backward');
      } else if (key === 'a' || key === 'arrowleft') {
        e.preventDefault();
        sendCommand('left');
      } else if (key === 'd' || key === 'arrowright') {
        e.preventDefault();
        sendCommand('right');
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        sendCommand('stop');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, sendCommand]);

  return (
    <div
      className={`teleop-pad-container ${disabled ? 'pad-disabled' : ''}`}
      aria-label="Robot Teleoperation Jog Controller"
      role="region"
    >
      <div className="teleop-outer-circle">
        {/* Forward (W) */}
        <button
          className={`dpad-btn dpad-up ${activeDirection === 'forward' ? 'btn-active' : ''}`}
          onMouseDown={() => sendCommand('forward')}
          onMouseUp={() => sendCommand('stop')}
          onMouseLeave={() => activeDirection === 'forward' && sendCommand('stop')}
          onTouchStart={() => sendCommand('forward')}
          onTouchEnd={() => sendCommand('stop')}
          title="Drive Forward (W / Up Arrow)"
          aria-label="Drive Forward"
          disabled={disabled}
        >
          <ChevronUp size={22} />
        </button>

        {/* Left (A) */}
        <button
          className={`dpad-btn dpad-left ${activeDirection === 'left' ? 'btn-active' : ''}`}
          onMouseDown={() => sendCommand('left')}
          onMouseUp={() => sendCommand('stop')}
          onMouseLeave={() => activeDirection === 'left' && sendCommand('stop')}
          onTouchStart={() => sendCommand('left')}
          onTouchEnd={() => sendCommand('stop')}
          title="Turn Left (A / Left Arrow)"
          aria-label="Turn Left"
          disabled={disabled}
        >
          <ChevronLeft size={22} />
        </button>

        {/* Center Key Mapping Hub */}
        <div className="dpad-center-hub">
          <span className="key-north">W</span>
          <div className="key-middle-row">
            <span className="key-west">A</span>
            <span className="key-label">key</span>
            <span className="key-east">D</span>
          </div>
          <span className="key-south">S</span>
        </div>

        {/* Right (D) */}
        <button
          className={`dpad-btn dpad-right ${activeDirection === 'right' ? 'btn-active' : ''}`}
          onMouseDown={() => sendCommand('right')}
          onMouseUp={() => sendCommand('stop')}
          onMouseLeave={() => activeDirection === 'right' && sendCommand('stop')}
          onTouchStart={() => sendCommand('right')}
          onTouchEnd={() => sendCommand('stop')}
          title="Turn Right (D / Right Arrow)"
          aria-label="Turn Right"
          disabled={disabled}
        >
          <ChevronRight size={22} />
        </button>

        {/* Backward (S) */}
        <button
          className={`dpad-btn dpad-down ${activeDirection === 'backward' ? 'btn-active' : ''}`}
          onMouseDown={() => sendCommand('backward')}
          onMouseUp={() => sendCommand('stop')}
          onMouseLeave={() => activeDirection === 'backward' && sendCommand('stop')}
          onTouchStart={() => sendCommand('backward')}
          onTouchEnd={() => sendCommand('stop')}
          title="Drive Backward (S / Down Arrow)"
          aria-label="Drive Backward"
          disabled={disabled}
        >
          <ChevronDown size={22} />
        </button>
      </div>
    </div>
  );
}

