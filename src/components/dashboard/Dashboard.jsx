import React, { useState, useEffect, useCallback } from 'react';
import HeaderHUD from '../layout/HeaderHUD';
import CameraPanel from '../camera/CameraPanel';
import WarehouseMap2D from '../pointcloud/WarehouseMap2D';
import PointCloudViewer from '../pointcloud/PointCloudViewer';
import TeleopPad from './TeleopPad';
import EStopButton from './EStopButton';
import ZoomSlider from './ZoomSlider';
import QuickGoalModal from './QuickGoalModal';
import RosConnectionModal from './RosConnectionModal';
import TelemetryDrawer from './TelemetryDrawer';
import WaypointsDrawer from './WaypointsDrawer';
import { robotSimulator } from '../../services/robotSimulator';
import { rosService } from '../../services/rosService';
import './Dashboard.css';

export default function Dashboard({
  activeTab,
  isRosModalOpen,
  onCloseRosModal,
  rosStatus
}) {
  // Simulator & Telemetry State
  const [robotState, setRobotState] = useState(robotSimulator.state);

  // View States
  const [activeView, setActiveView] = useState('map'); // 'map' | 'camera'
  const [mapSubMode, setMapSubMode] = useState('2d'); // '2d' (Reference SLAM map) | '3d' (Three.js PCD)
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Modals & Drawers
  const [isQuickGoalOpen, setIsQuickGoalOpen] = useState(false);
  const [isTelemetryDrawerOpen, setIsTelemetryDrawerOpen] = useState(false);
  const [isWaypointsDrawerOpen, setIsWaypointsDrawerOpen] = useState(false);

  // Subscribe to robot simulator updates
  useEffect(() => {
    const unsubscribe = robotSimulator.subscribe((state) => {
      setRobotState(state);
    });
    return unsubscribe;
  }, []);

  // Handle active navigation tab from sidebar
  useEffect(() => {
    if (activeTab === 'telemetry') {
      setIsTelemetryDrawerOpen(true);
    } else if (activeTab === 'waypoints') {
      setIsWaypointsDrawerOpen(true);
    } else if (activeTab === 'map') {
      setActiveView('map');
      setMapSubMode('3d');
    } else if (activeTab === 'dashboard') {
      setActiveView('map');
      setMapSubMode('2d');
    }
  }, [activeTab]);

  // View Swap Handler (Main <-> PiP)
  const handleToggleViewMode = useCallback(() => {
    setActiveView((prev) => (prev === 'map' ? 'camera' : 'map'));
  }, []);

  // Robot Action Handlers
  const handleTogglePause = () => {
    robotSimulator.toggleMissionPause();
  };

  const handleSetMode = (mode) => {
    robotSimulator.setMode(mode);
  };

  const handleToggleEStop = () => {
    robotSimulator.triggerEStop();
  };

  const handleDrive = (linear, angular) => {
    robotSimulator.setTeleopVelocity(linear, angular);
    // Also publish to ROS if connected
    if (rosStatus === 'CONNECTED') {
      rosService.publishCmdVel(linear, angular);
    }
  };

  const handleDispatchQuickGoal = (x, y, name) => {
    robotSimulator.setQuickGoal(x, y, name);
  };

  const handleInitiate = () => {
    robotSimulator.initiateMission();
  };

  return (
    <main className="dashboard-root-container">
      {/* Top Floating Header HUD */}
      <HeaderHUD
        robotState={robotState}
        onTogglePause={handleTogglePause}
        onSetMode={handleSetMode}
        onQuickGoalClick={() => setIsQuickGoalOpen(true)}
        onInitiateClick={handleInitiate}
        activeView={activeView}
        onToggleViewMode={handleToggleViewMode}
      />

      {/* PRIMARY VIEWPORT CONTAINER (Full Screen Behind Overlays) */}
      <div className="primary-viewport-container">
        {activeView === 'map' ? (
          mapSubMode === '2d' ? (
            <WarehouseMap2D
              robotState={robotState}
              zoomLevel={zoomLevel}
              onMapClick={(x, y) => handleDispatchQuickGoal(x, y, `Custom (${x}, ${y})`)}
              onToggle3DMode={() => setMapSubMode('3d')}
            />
          ) : (
            <PointCloudViewer
              zoomLevel={zoomLevel}
              robotState={robotState}
            />
          )
        ) : (
          <CameraPanel
            isPip={false}
            robotState={robotState}
          />
        )}
      </div>

      {/* BOTTOM-LEFT PICTURE-IN-PICTURE (PiP) & ZOOM CONTROLS */}
      <div className="bottom-left-group">
        {/* Vertical Zoom Slider */}
        <ZoomSlider
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
        />

        {/* Secondary View PiP Card */}
        <div className="pip-window-card">
          {activeView === 'map' ? (
            <CameraPanel
              isPip={true}
              onSwapView={handleToggleViewMode}
              robotState={robotState}
            />
          ) : (
            <WarehouseMap2D
              isPip={true}
              robotState={robotState}
              onSwapView={handleToggleViewMode}
              zoomLevel={0.8}
            />
          )}
        </div>
      </div>

      {/* BOTTOM-RIGHT TELEOPERATION & SAFETY CONTROLS */}
      <div className="bottom-right-group">
        {/* Emergency Stop Button */}
        <EStopButton
          isEStopActive={robotState.isEStop}
          onToggleEStop={handleToggleEStop}
        />

        {/* Virtual Jog Controller (D-Pad) */}
        <TeleopPad
          onDrive={handleDrive}
          disabled={robotState.isEStop || robotState.mode === 'AUTO'}
        />
      </div>

      {/* MODALS & DRAWERS */}
      <QuickGoalModal
        isOpen={isQuickGoalOpen}
        onClose={() => setIsQuickGoalOpen(false)}
        onDispatchGoal={handleDispatchQuickGoal}
      />

      <RosConnectionModal
        isOpen={isRosModalOpen}
        onClose={onCloseRosModal}
        rosStatus={rosStatus}
      />

      <TelemetryDrawer
        isOpen={isTelemetryDrawerOpen}
        onClose={() => setIsTelemetryDrawerOpen(false)}
        robotState={robotState}
      />

      <WaypointsDrawer
        isOpen={isWaypointsDrawerOpen}
        onClose={() => setIsWaypointsDrawerOpen(false)}
        robotState={robotState}
        onSelectWaypoint={handleDispatchQuickGoal}
      />
    </main>
  );
}
