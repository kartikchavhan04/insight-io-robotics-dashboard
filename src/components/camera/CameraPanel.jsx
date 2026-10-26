import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Camera,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import './CameraPanel.css';

export const VIDEO_SOURCES = [
  {
    id: 'rover-cam',
    name: 'AMR Front Wide (1080p)',
    src: '/assets/video/rover-camera.mp4',
    type: 'video/mp4',
    fps: 30,
    resolution: '1920x1080',
    latency: '18 ms'
  },
  {
    id: 'facility-cam',
    name: 'Facility Surveillance Cam',
    src: '/assets/video/facility-surveillance.mp4',
    type: 'video/mp4',
    fps: 30,
    resolution: '1280x720',
    latency: '24 ms'
  },
  {
    id: 'webcam',
    name: 'Live Device Webcam',
    src: null,
    type: 'webcam',
    fps: 30,
    resolution: 'Auto',
    latency: '5 ms'
  }
];

export default function CameraPanel({
  isPip = false,
  onSwapView,
  robotState: _robotState
}) {
  const [selectedSourceId, setSelectedSourceId] = useState('rover-cam');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const streamRef = useRef(null);

  const currentSource = VIDEO_SOURCES.find((s) => s.id === selectedSourceId) || VIDEO_SOURCES[0];

  // Handle webcam vs local video switching
  useEffect(() => {
    let isMounted = true;
    setHasError(false);
    setErrorMessage('');

    if (currentSource.type === 'webcam') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
          .then((stream) => {
            if (!isMounted) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
            setIsWebcamActive(true);
          })
          .catch((err) => {
            if (isMounted) {
              setHasError(true);
              setErrorMessage(
                err.name === 'NotAllowedError'
                  ? 'Camera permission was denied. Please allow camera access in browser settings.'
                  : `Camera error: ${err.message}`
              );
            }
          });
      } else {
        setHasError(true);
        setErrorMessage('Webcam access is not supported by your browser.');
      }
    } else {
      // Clean up webcam stream if switching away
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsWebcamActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = currentSource.src;
        if (typeof videoRef.current.load === 'function') {
          videoRef.current.load();
        }
        if (typeof videoRef.current.play === 'function') {
          const playPromise = videoRef.current.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              setIsPlaying(false);
            });
          }
        }
      }
    }

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [selectedSourceId, currentSource]);

  const togglePlay = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      if (typeof videoRef.current.pause === 'function') {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (typeof videoRef.current.play === 'function') {
        const playPromise = videoRef.current.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(() => setIsPlaying(true)).catch(() => {});
        } else {
          setIsPlaying(true);
        }
      }
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = (e) => {
    e?.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    setErrorMessage(`Failed to load video file (${currentSource.src}). Ensure local asset exists.`);
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`camera-panel-container ${isPip ? 'camera-pip' : 'camera-main'}`}
      onClick={isPip ? onSwapView : undefined}
      title={isPip ? 'Click to switch to Camera View' : undefined}
      aria-label="Camera Video Stream"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="camera-video-element"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onError={handleVideoError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Video OSD Overlay Badge */}
      <div className="camera-osd-badge">
        <div className="osd-live-indicator">
          <span className="live-dot" />
          <span className="live-text">{isWebcamActive ? 'WEBCAM' : 'FEED'}</span>
        </div>
        <span className="osd-res">{currentSource.resolution}</span>
        <span className="osd-fps">{currentSource.fps} FPS</span>
        <span className="osd-latency">{currentSource.latency}</span>
      </div>

      {/* PiP Click Prompt */}
      {isPip && (
        <div className="pip-hover-overlay">
          <span className="pip-hover-label">Click to Expand Camera View</span>
        </div>
      )}

      {/* Error / Placeholder Fallback */}
      {hasError && (
        <div className="camera-error-overlay">
          <AlertCircle size={32} className="error-icon" />
          <p className="error-title">Camera Feed Unavailable</p>
          <p className="error-desc">{errorMessage}</p>
          <button className="error-retry-btn" onClick={handleRetry}>
            <RotateCcw size={14} /> Retry Video
          </button>
        </div>
      )}

      {/* Camera Controls Bar (visible in Main View) */}
      {!isPip && (
        <div className="camera-controls-bar" onClick={(e) => e.stopPropagation()}>
          <div className="controls-left">
            <button
              className="ctrl-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause Video' : 'Play Video'}
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
            <button
              className="ctrl-btn"
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <span className="time-display">
              {Math.floor(currentTime)}s / {Math.floor(duration || 0)}s
            </span>
          </div>

          {/* Camera Selection Dropdown */}
          <div className="controls-center">
            <div className="camera-select-wrapper">
              <Camera size={14} className="camera-icon-inline" />
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="camera-dropdown"
                aria-label="Select Camera Stream"
              >
                {VIDEO_SOURCES.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="controls-right">
            <button
              className="ctrl-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
