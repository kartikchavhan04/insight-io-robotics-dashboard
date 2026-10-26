import React, { useState } from 'react';
import { Target, X, Check, Navigation } from 'lucide-react';
import './QuickGoalModal.css';

const PRESET_GOALS = [
  { id: 'dock', name: 'Docking & Charge Station', x: 0, y: -28 },
  { id: 'bay1', name: 'Material Loading Bay A', x: -8, y: 15 },
  { id: 'pack', name: 'Automated Packaging Unit', x: -6, y: 25 },
  { id: 'lab', name: 'Central Electronics Lab', x: 8, y: 5 },
  { id: 'inspect', name: 'Quality Inspection Station', x: 0, y: -5 }
];

export default function QuickGoalModal({ isOpen, onClose, onDispatchGoal }) {
  const [customX, setCustomX] = useState(0);
  const [customY, setCustomY] = useState(0);

  if (!isOpen) return null;

  const handlePresetSelect = (preset) => {
    onDispatchGoal(preset.x, preset.y, preset.name);
    onClose();
  };

  const handleCustomDispatch = (e) => {
    e.preventDefault();
    onDispatchGoal(parseFloat(customX), parseFloat(customY), `Target (${customX}, ${customY})`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Target size={18} className="modal-title-icon" />
            <h3>Quick Goal Navigation</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={18} />
          </button>
        </div>

        <p className="modal-desc">
          Select a facility station preset or enter custom coordinates to dispatch the robot immediately.
        </p>

        {/* Preset Locations */}
        <div className="preset-goals-list">
          <span className="preset-section-title">Facility Stations</span>
          {PRESET_GOALS.map((preset) => (
            <button
              key={preset.id}
              className="preset-item-btn"
              onClick={() => handlePresetSelect(preset)}
            >
              <div className="preset-info">
                <span className="preset-name">{preset.name}</span>
                <span className="preset-coords">X: {preset.x}m, Y: {preset.y}m</span>
              </div>
              <Navigation size={14} className="preset-arrow" />
            </button>
          ))}
        </div>

        {/* Custom Coordinates Form */}
        <form onSubmit={handleCustomDispatch} className="custom-coords-form">
          <span className="preset-section-title">Manual Target Coordinates</span>
          <div className="coord-inputs-row">
            <div className="input-field">
              <label htmlFor="coord-x">X (meters)</label>
              <input
                id="coord-x"
                type="number"
                step="0.5"
                min="-22"
                max="22"
                value={customX}
                onChange={(e) => setCustomX(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label htmlFor="coord-y">Y (meters)</label>
              <input
                id="coord-y"
                type="number"
                step="0.5"
                min="-35"
                max="35"
                value={customY}
                onChange={(e) => setCustomY(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="custom-dispatch-btn">
            <Check size={14} /> Dispatch Target
          </button>
        </form>
      </div>
    </div>
  );
}

