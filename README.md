# Insight.IO — Industrial Robotics Monitoring & Teleoperation Dashboard

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Tests](https://img.shields.io/badge/tests-19%20passed-success.svg)](#)
[![ESLint](https://img.shields.io/badge/eslint-0%20warnings-brightgreen.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg)](#)
[![Three.js](https://img.shields.io/badge/Three.js-0.174-black.svg)](#)

> **Submission for ERIC Robotics Full Stack Developer Assignment #1**  
> **Candidate Name:** Kartik Panjab Chavhan 
> **Contact Number:** 9322763544 
> **Email ID:** kartikpchavhan2004@gmail.com 

---

## 1. Project Overview

**Insight.IO** is a production-grade, self-hosted web monitoring and teleoperation dashboard engineered for industrial **Autonomous Mobile Robots (AMRs)** and automated robotic fleets. 

Built to faithfully reproduce the official ERIC Robotics reference design, Insight.IO provides operators with synchronized situational awareness:
- **Interactive 2D Facility SLAM Plan**: Real-time robot avatar localization, animated LiDAR radar sweep, designated safety zones, obstacle clusters, and breadcrumb navigation trail.
- **Hardware-Accelerated 3D Point-Cloud Viewer**: Three.js WebGL scene supporting standard `.pcd` point clouds (ASCII, Binary, Binary Compressed), interactive orbit controls (pan, tilt, zoom), multiple colormap shaders (Elevation Heatmap, LiDAR Reflectance, Industrial Slate, Cyberpunk), and custom `.pcd` drag-and-drop ingestion.
- **Industrial Camera View**: HTML5 video pipeline supporting local H.264 MP4 streams, multi-camera switching, live browser webcam integration with permission handling, and OSD telemetry overlays (FPS, resolution, latency, codec).
- **Picture-in-Picture (PiP) Seamless View Swapping**: One-click transition between Camera View and Map View as shown in the reference demo.
- **Safety Critical E-Stop System**: Two-stage Emergency Stop with yellow safety bezel, locking mechanisms, visual warning pulses, and drive lockout.
- **Virtual Jog Teleoperation Controller**: High-precision D-Pad supporting mouse click/hold and keyboard shortcuts (`W`, `A`, `S`, `D` and arrow keys).
- **Modular ROS Integration**: Built-in support for `rosbridge_suite` WebSockets to stream `/odom`, `/scan`, `/battery_state`, and dispatch `/cmd_vel` Twist packets.
- **100% Offline Independence**: Zero runtime dependencies on external CDNs, web fonts, or cloud APIs.

---

## 2. Visual Comparison & Architecture

### Desktop Dashboard Layout
The interface mirrors the reference design structure:
1. **Left Sidebar**: ERIC Robotics branding, module navigation (Dashboard, 3D Map, Waypoints, Geofences, Sensors, Telemetry), and ROS status indicator.
2. **Top Telemetry HUD**: Mission status (`On Mission 1234`), Pause/Resume pill, Quick Goal action, floating battery/signal/failsafe telemetry bar, view switcher pill, and Auto/Manual mode toggle.
3. **Primary Viewport**: Full-bleed 2D Facility Plan or Three.js 3D Point Cloud View.
4. **Bottom-Left Controls**: Vertical zoom slider linked to camera projection, and Picture-in-Picture (PiP) secondary feed card.
5. **Bottom-Right Safety & Teleoperation**: Circular Emergency Stop and 4-way Jog Controller.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              TOP HUD BAR                               │
│ [Status: On Mission] [Quick Goal]  (Telemetry Bar)  [Mode: Auto] [Initiate]│
├──────┬─────────────────────────────────────────────────────────────────┤
│ ERIC │                                                                 │
│      │                  PRIMARY VIEWPORT                               │
│ [⊞]  │      (2D Facility SLAM Plan / 3D Three.js Point Cloud)          │
│ [🗺]  │                                                                 │
│ [📍]  │                                                                 │
│ [⛶]  │                                                    [E-STOP]     │
│ [🎯]  │  [Zoom] [PiP View]                                  (D-PAD)    │
│ [📈]  │   +/-   (Camera/Map)                                W / A / S / D│
└──────┴─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

- **Framework**: [React 18.3.1](https://react.dev/)
- **Build Tool & Dev Server**: [Vite 6.2.0](https://vitejs.dev/)
- **3D Robotics Visualization**: [Three.js 0.174.0](https://threejs.org/) + `PCDLoader` + `OrbitControls`
- **Iconography**: [Lucide React 0.475.0](https://lucide.dev/)
- **Robotics Middleware Client**: [ROSLib.js 1.4.1](https://github.com/RobotWebTools/roslibjs)
- **Styling**: Modern CSS3 Custom Properties & Design Tokens (no heavy CSS utility overhead)
- **Unit & Integration Testing**: [Vitest 3.0.7](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) + JSDOM
- **Code Quality**: [ESLint 9](https://eslint.org/) (Zero warnings configuration)

---

## 4. Quick Start & Prerequisites

### Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node v24.20.0)
- **npm**: v9.0.0 or later (Tested on npm 11.19.0)

### 1. Installation
Clone this repository and install local dependencies:
```bash
git clone https://github.com/kartikchavhan04/insight-io-robotics-dashboard.git
cd insight-io-robotics-dashboard
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000` (or `http://localhost:5173`). Open the URL in your browser.

### 3. Production Build & Local Preview
```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### 4. Run Automated Test Suite
```bash
npm test
```
Runs 19 automated tests covering state kinematics, emergency stop logic, teleoperation events, PCD colormap shaders, and UI rendering.

### 5. Run Lint Check
```bash
npm run lint
```
Executes ESLint across all source and test files.

---

## 5. Feature Guide

### A. Camera View
- **Default Media Asset**: Bundled locally in `public/assets/video/rover-camera.mp4` (H.264 encoded MP4, 30 FPS).
- **Secondary Asset**: `public/assets/video/facility-surveillance.mp4` for multi-cam monitoring.
- **Live Webcam Mode**: Switch to "Live Device Webcam" in the camera stream selector to use your local browser camera via WebRTC `getUserMedia`.
- **Controls**: Play, Pause, Mute/Unmute, Fullscreen toggle, and OSD Telemetry readout.
- **Fault Tolerance**: Graceful error screen with retry button if a media file is missing or corrupted.

### B. 3D Point Cloud View (Three.js)
Click the **"Switch to 3D Point Cloud View"** button on the map to enter the interactive Three.js environment:
- **Datasets Included Locally**:
  1. `warehouse_slam.pcd`: High-resolution SLAM scan of the industrial facility (158,422 points, ASCII format).
  2. `kitti_sample.pcd`: Real Velodyne LiDAR point cloud from the KITTI Autonomous Driving dataset (115,384 points, binary format).
  3. `table_scene_lms400.pcd`: Industrial LMS400 sensor dataset (460,400 points, binary compressed format).
  4. `bunny.pcd`: Stanford 3D scanning benchmark (ASCII format).
- **Custom PCD Ingestion**: Click the **"Load PCD"** button to upload and visualize *any* `.pcd` file directly from your local filesystem.
- **Shader Colormaps**: Toggle between Elevation (Z-height heatmap), LiDAR Intensity (reflectance), Industrial Slate, and Cyberpunk.
- **Interactive Orbit**: Left-click + drag to rotate; Right-click + drag to pan; Scroll wheel or use the vertical Zoom Slider to zoom.

### C. 2D Facility SLAM Map
- **Visual Accuracy**: Faithful reproduction of the reference demo, including structural pillars, safety zones ("Meeting Room", "Lab", "Work Zone Alpha", "Packing Area"), and wall contours.
- **Dynamic Localization**: Animated robot avatar with heading indicator, WiFi antenna signal, and 360° radar sweep cone.
- **Click-to-Dispatch (Quick Goal)**: Click anywhere on the facility floor to dispatch the robot to that coordinate.

### D. Picture-in-Picture (PiP) Swapping
- Click either the floating bottom-left PiP card or the top-center **"Map View / Camera View"** pill button to swap primary and secondary feeds smoothly.

### E. Teleoperation & Safety (E-Stop & D-Pad)
- **Mode Toggle**: Switch from `AUTO` to `MANUAL` using the top-right pill.
- **Teleoperation Jog Controller**: Press and hold `W` (Forward), `S` (Backward), `A` (Turn Left), or `D` (Turn Right). Supports physical keyboard keys and on-screen mouse clicks.
- **Emergency Stop**: Click the E-Stop button (or press `Spacebar` when focused) to engage safety lockouts. The robot immediately halts (`velocity = 0`), the status changes to `EMERGENCY STOP ENGAGED`, and driving inputs are disabled until reset.

### F. Optional ROS Integration
- Click the radio icon in the bottom-left sidebar to open the ROS Bridge connection modal.
- Enter your WebSocket URL (default: `ws://localhost:9090`).
- When connected, teleoperation commands are published as `geometry_msgs/Twist` on `/cmd_vel`, and robot odometry is ingested from `/odom`.
- If disconnected, the dashboard operates autonomously using its built-in kinematics simulator.

---

## 6. Project Structure

```
insight-io-robotics-dashboard/
├── docs/
│   └── screenshots/              # Application screenshots
├── public/
│   ├── assets/
│   │   ├── pointcloud/           # Local .pcd point cloud datasets
│   │   │   ├── bunny.pcd
│   │   │   ├── kitti_sample.pcd
│   │   │   ├── table_scene_lms400.pcd
│   │   │   └── warehouse_slam.pcd
│   │   └── video/                # Local H.264 MP4 camera video feeds
│   │       ├── facility-surveillance.mp4
│   │       └── rover-camera.mp4
│   └── vite.svg                  # Brand favicon
├── src/
│   ├── components/
│   │   ├── camera/               # Video player & WebRTC webcam panel
│   │   │   ├── CameraPanel.jsx
│   │   │   └── CameraPanel.css
│   │   ├── dashboard/            # Teleop jog, E-Stop, modals, drawers
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.css
│   │   │   ├── EStopButton.jsx
│   │   │   ├── EStopButton.css
│   │   │   ├── QuickGoalModal.jsx
│   │   │   ├── RosConnectionModal.jsx
│   │   │   ├── TelemetryDrawer.jsx
│   │   │   ├── TeleopPad.jsx
│   │   │   ├── WaypointsDrawer.jsx
│   │   │   └── ZoomSlider.jsx
│   │   ├── layout/               # Navigation sidebar & top telemetry HUD
│   │   │   ├── HeaderHUD.jsx
│   │   │   ├── HeaderHUD.css
│   │   │   ├── Sidebar.jsx
│   │   │   └── Sidebar.css
│   │   └── pointcloud/           # 2D SLAM Plan & Three.js 3D PointCloud Viewer
│   │       ├── PointCloudViewer.jsx
│   │       ├── PointCloudViewer.css
│   │       ├── WarehouseMap2D.jsx
│   │       └── WarehouseMap2D.css
│   ├── services/                 # Robot kinematics engine & ROS bridge
│   │   ├── robotSimulator.js
│   │   └── rosService.js
│   ├── styles/                   # Design system tokens and animations
│   │   ├── index.css
│   │   └── variables.css
│   ├── tests/                    # Vitest unit & integration test suite
│   │   ├── App.test.jsx
│   │   ├── CameraPanel.test.jsx
│   │   ├── EStopButton.test.jsx
│   │   ├── PcdLoaderHelper.test.jsx
│   │   ├── RobotSimulator.test.jsx
│   │   ├── TeleopPad.test.jsx
│   │   └── setup.js
│   ├── utils/                    # PCD loader helpers & colormap shaders
│   │   └── pcdLoaderHelper.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── scripts/                      # Utility scripts (PCD generator, screenshots)
├── eslint.config.js              # ESLint 9 configuration
├── index.html                    # Self-hosted entrypoint
├── package.json
├── vite.config.js
├── LICENSE                       # MIT License
└── README.md
```

---

## 7. Media Sources & Licensing Attribution

All media and sensor assets bundled with this project are open-source and permitted for redistribution:
1. **Camera Video (`rover-camera.mp4`, `facility-surveillance.mp4`)**:
   - Source: [Intel IoT DevKit Sample Media Repository](https://github.com/intel-iot-devkit/sample-videos)
   - License: Open-source sample data for computer vision inference.
2. **KITTI Point Cloud (`kitti_sample.pcd`)**:
   - Source: [KITTI Vision Benchmark Suite](http://www.cvlibs.net/datasets/kitti/) / [JLIN77 kitti_bin2pcd](https://github.com/JLIN77/kitti_bin2pcd)
   - Converted from binary Velodyne `.bin` LiDAR scan format (`x, y, z, intensity`) into standard `.pcd` format.
3. **LMS400 Point Cloud (`table_scene_lms400.pcd`) & Stanford Bunny (`bunny.pcd`)**:
   - Source: [PointCloudLibrary (PCL) Official Test Data](https://github.com/PointCloudLibrary/pcl)
   - License: BSD 3-Clause.
4. **Warehouse SLAM Dataset (`warehouse_slam.pcd`)**:
   - Generated using LiDAR ray casting simulation matching the exact architectural layout of the ERIC Robotics demo facility.

---

## 8. Offline Operation Verification

The application is completely self-contained:
- **No external fonts**: Uses system typography stacks (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`).
- **No external CDN scripts**: Bundled completely via Vite.
- **Local assets**: Video and point cloud files are served directly from the `public/assets/` directory.
- Can run on an isolated air-gapped machine without internet access once `node_modules` are installed.

---

## 9. Verification & Test Results

Executed commands:
```text
✓ npm run lint    --> 0 errors, 0 warnings (passed)
✓ npm test        --> 19 passed across 6 test suites (passed)
✓ npm run build   --> Production bundle compiled in 7.57s (dist/ verified)
```

---

## 10. Repository & Running Locally

**GitHub Repository:**  
https://github.com/kartikchavhan04/insight-io-robotics-dashboard

### Setup

```bash
git clone https://github.com/kartikchavhan04/insight-io-robotics-dashboard.git
cd insight-io-robotics-dashboard
npm ci
npm run dev
```

### Verification

```bash
npm run lint
npm test
npm run build
```