import React from 'react';
import { Plus, Minus } from 'lucide-react';
import './ZoomSlider.css';

export default function ZoomSlider({
  zoomLevel = 1.0,
  minZoom = 0.4,
  maxZoom = 2.5,
  onZoomChange
}) {
  const handlePlus = () => {
    onZoomChange(Math.min(maxZoom, +(zoomLevel + 0.15).toFixed(2)));
  };

  const handleMinus = () => {
    onZoomChange(Math.max(minZoom, +(zoomLevel - 0.15).toFixed(2)));
  };

  const handleSlider = (e) => {
    onZoomChange(parseFloat(e.target.value));
  };

  return (
    <div className="zoom-slider-container" aria-label="Camera and Map Zoom Controls">
      <button
        className="zoom-btn zoom-plus"
        onClick={handlePlus}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>

      <div className="zoom-track-wrapper">
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step={0.05}
          value={zoomLevel}
          onChange={handleSlider}
          className="zoom-vertical-input"
          aria-label="Zoom Level"
        />
      </div>

      <button
        className="zoom-btn zoom-minus"
        onClick={handleMinus}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

