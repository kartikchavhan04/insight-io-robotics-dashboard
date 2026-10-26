import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadPcdDataset, applyColormap } from '../../utils/pcdLoaderHelper';
import {
  Layers,
  Upload,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import './PointCloudViewer.css';

export const PCD_DATASETS = [
  { id: 'warehouse', name: 'Warehouse SLAM (158k pts)', path: '/assets/pointcloud/warehouse_slam.pcd', defaultSize: 1.5 },
  { id: 'kitti', name: 'KITTI Velodyne LiDAR (115k pts)', path: '/assets/pointcloud/kitti_sample.pcd', defaultSize: 1.2 },
  { id: 'table', name: 'LMS400 Industrial Scene (460k pts)', path: '/assets/pointcloud/table_scene_lms400.pcd', defaultSize: 1.0 },
  { id: 'bunny', name: 'Stanford 3D Bunny (ASCII)', path: '/assets/pointcloud/bunny.pcd', defaultSize: 2.0 }
];

export default function PointCloudViewer({
  isPip = false,
  onSwapView,
  zoomLevel = 1.0,
  robotState
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const pointsMeshRef = useRef(null);
  const robotModelRef = useRef(null);
  const lidarConeRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [selectedDatasetId, setSelectedDatasetId] = useState('warehouse');
  const [colorMode, setColorMode] = useState('elevation');
  const [pointSize, setPointSize] = useState(1.4);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pointCount, setPointCount] = useState(0);
  const [fps, setFps] = useState(60);


  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isPip ? 0x090d16 : 0x0e131f);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, -35, 30);
    camera.up.set(0, 0, 1); // Z is up (robotics coordinate standard)
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below ground
    controls.minDistance = 2;
    controls.maxDistance = 150;
    controlsRef.current = controls;

    // Grid Floor
    const gridHelper = new THREE.GridHelper(60, 60, 0x38bdf8, 0x1e293b);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -0.01;
    scene.add(gridHelper);

    // Coordinate Axes
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, -20, 30);
    scene.add(dirLight);

    // 3D AMR Robot representation
    const robotGroup = new THREE.Group();
    // Chassis
    const chassisGeo = new THREE.BoxGeometry(1.2, 0.9, 0.45);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.6 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.z = 0.25;
    robotGroup.add(chassis);

    // Yellow Safety Guard Accents
    const guardGeo = new THREE.BoxGeometry(1.3, 0.95, 0.08);
    const guardMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.z = 0.1;
    robotGroup.add(guard);

    // LiDAR Puck on top
    const lidarGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.2, 16);
    lidarGeo.rotateX(Math.PI / 2);
    const lidarMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.2 });
    const lidar = new THREE.Mesh(lidarGeo, lidarMat);
    lidar.position.z = 0.58;
    robotGroup.add(lidar);

    // Animated LiDAR Sensor Sweep Cone
    const coneGeo = new THREE.ConeGeometry(8, 6, 32, 1, true, 0, Math.PI / 3);
    coneGeo.rotateX(-Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const lidarCone = new THREE.Mesh(coneGeo, coneMat);
    lidarCone.position.z = 0.58;
    robotGroup.add(lidarCone);
    lidarConeRef.current = lidarCone;

    scene.add(robotGroup);
    robotModelRef.current = robotGroup;

    // Render Loop & FPS calculation
    let frameCount = 0;
    let lastTime = performance.now();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      controls.update();

      // Rotate LiDAR radar cone
      if (lidarConeRef.current) {
        lidarConeRef.current.rotation.z += 0.04;
      }

      renderer.render(scene, camera);

      // FPS tracking
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
    };
    animate();

    // Window / Container Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (pointsMeshRef.current) {
        scene.remove(pointsMeshRef.current);
        pointsMeshRef.current.geometry.dispose();
        pointsMeshRef.current.material.dispose();
      }
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isPip]);

  // Synchronize robot pose from telemetry simulator
  useEffect(() => {
    if (!robotModelRef.current || !robotState) return;
    robotModelRef.current.position.set(robotState.x, robotState.y, 0);
    robotModelRef.current.rotation.z = robotState.heading;
  }, [robotState]);

  // Synchronize zoom level from slider
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const baseDist = 45;
    const targetDist = baseDist / Math.max(0.2, zoomLevel);
    const camera = cameraRef.current;
    const target = controlsRef.current.target;
    
    const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
    camera.position.copy(target).addScaledVector(dir, targetDist);
    controlsRef.current.update();
  }, [zoomLevel]);

  // Load selected PCD dataset
  const loadDataset = useCallback(async (source) => {
    setIsLoading(true);
    setLoadingProgress(0);
    setErrorMsg(null);

    try {
      const points = await loadPcdDataset(source, (progress) => {
        setLoadingProgress(progress);
      });

      if (!sceneRef.current) return;

      // Remove existing point cloud mesh
      if (pointsMeshRef.current) {
        sceneRef.current.remove(pointsMeshRef.current);
        pointsMeshRef.current.geometry.dispose();
        if (pointsMeshRef.current.material) {
          pointsMeshRef.current.material.dispose();
        }
      }

      // Configure PointCloud Material
      points.material.size = pointSize;
      points.material.sizeAttenuation = true;
      points.material.transparent = true;
      points.material.opacity = 0.95;

      // Center geometry if off-center
      points.geometry.computeBoundingBox();
      const bbox = points.geometry.boundingBox;
      if (bbox) {
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        // If dataset is extremely offset, center it on XY
        if (Math.abs(center.x) > 50 || Math.abs(center.y) > 50) {
          points.geometry.center();
        }
      }

      applyColormap(points, colorMode);

      sceneRef.current.add(points);
      pointsMeshRef.current = points;
      setPointCount(points.geometry.attributes.position.count);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load point cloud dataset:', err);
      setErrorMsg(err.message || 'Error loading PCD file');
      setIsLoading(false);
    }
  }, [pointSize, colorMode]);

  // Trigger dataset load on selection change
  useEffect(() => {
    const dataset = PCD_DATASETS.find((d) => d.id === selectedDatasetId);
    if (dataset) {
      loadDataset(dataset.path);
    }
  }, [selectedDatasetId, loadDataset]);

  // Update colormap on colorMode change
  useEffect(() => {
    if (pointsMeshRef.current) {
      applyColormap(pointsMeshRef.current, colorMode);
    }
  }, [colorMode]);

  // Update point size
  useEffect(() => {
    if (pointsMeshRef.current && pointsMeshRef.current.material) {
      pointsMeshRef.current.material.size = pointSize;
      pointsMeshRef.current.material.needsUpdate = true;
    }
  }, [pointSize]);

  // Handle Custom Local PCD File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pcd')) {
      setErrorMsg('Please select a valid .pcd point cloud file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target.result;
      setSelectedDatasetId('custom');
      loadDataset(buffer);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read uploaded file.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleResetCamera = (e) => {
    e.stopPropagation();
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, -35, 30);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div
      className={`pointcloud-viewer-container ${isPip ? 'pcd-pip' : 'pcd-main'}`}
      onClick={isPip ? onSwapView : undefined}
      title={isPip ? 'Click to switch to 3D Point Cloud View' : undefined}
      aria-label="3D Point Cloud Map View"
    >
      {/* Three.js Canvas Mount */}
      <div ref={mountRef} className="pcd-canvas-mount" />

      {/* Point Cloud Telemetry OSD */}
      <div className="pcd-osd-badge">
        <span className="pcd-osd-dataset">
          {PCD_DATASETS.find((d) => d.id === selectedDatasetId)?.name || 'Custom PCD'}
        </span>
        <span className="pcd-osd-points">{pointCount.toLocaleString()} pts</span>
        <span className="pcd-osd-fps">{fps} FPS</span>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="pcd-loading-overlay">
          <div className="pcd-spinner" />
          <p className="pcd-loading-text">Loading 3D Point Cloud Dataset...</p>
          {loadingProgress > 0 && <span className="pcd-progress-pct">{loadingProgress}%</span>}
        </div>
      )}

      {/* Error Overlay */}
      {errorMsg && (
        <div className="pcd-error-overlay">
          <AlertTriangle size={30} className="pcd-error-icon" />
          <p className="pcd-error-title">Point Cloud Load Error</p>
          <p className="pcd-error-msg">{errorMsg}</p>
          <button
            className="pcd-retry-btn"
            onClick={(e) => {
              e.stopPropagation();
              const dataset = PCD_DATASETS.find((d) => d.id === selectedDatasetId);
              if (dataset) loadDataset(dataset.path);
            }}
          >
            <RotateCcw size={14} /> Retry Load
          </button>
        </div>
      )}

      {/* PiP Hover Prompt */}
      {isPip && (
        <div className="pip-hover-overlay">
          <span className="pip-hover-label">Click to Expand 3D Map View</span>
        </div>
      )}

      {/* Interactive Controls & Dataset Switcher (visible in main view) */}
      {!isPip && (
        <div className="pcd-controls-toolbar" onClick={(e) => e.stopPropagation()}>
          {/* Dataset Selector */}
          <div className="pcd-select-group">
            <Layers size={14} className="toolbar-icon" />
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="pcd-dropdown"
              aria-label="Select Point Cloud Dataset"
            >
              {PCD_DATASETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
              {selectedDatasetId === 'custom' && <option value="custom">Uploaded Custom PCD</option>}
            </select>
          </div>

          {/* Colormap Selector */}
          <div className="pcd-select-group">
            <select
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value)}
              className="pcd-dropdown"
              aria-label="Select Colormap"
            >
              <option value="elevation">Elevation Heatmap</option>
              <option value="intensity">LiDAR Intensity</option>
              <option value="industrial">Industrial Slate</option>
              <option value="cyberpunk">Cyber Neon</option>
            </select>
          </div>

          {/* Point Size Adjust */}
          <div className="point-size-control">
            <span className="size-label">Size</span>
            <input
              type="range"
              min={0.6}
              max={4.0}
              step={0.2}
              value={pointSize}
              onChange={(e) => setPointSize(parseFloat(e.target.value))}
              className="pcd-size-slider"
              title={`Point Size: ${pointSize}px`}
              aria-label="Point Size"
            />
          </div>

          {/* Upload Custom File Button */}
          <label className="pcd-upload-btn" title="Upload local .pcd file">
            <Upload size={13} />
            <span>Load PCD</span>
            <input
              type="file"
              accept=".pcd"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>

          {/* Reset View Button */}
          <button
            className="pcd-tool-btn"
            onClick={handleResetCamera}
            title="Reset 3D Camera"
            aria-label="Reset Camera"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
