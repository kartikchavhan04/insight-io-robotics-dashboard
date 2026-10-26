import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import { rosService } from './services/rosService';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRosModalOpen, setIsRosModalOpen] = useState(false);
  const [rosStatus, setRosStatus] = useState(rosService.status);

  useEffect(() => {
    const unsubscribe = rosService.subscribeStatus((status) => {
      setRosStatus(status);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenRosModal={() => setIsRosModalOpen(true)}
        rosStatus={rosStatus}
      />

      {/* Main Dashboard Workspace */}
      <div className="dashboard-wrapper">
        <Dashboard
          activeTab={activeTab}
          onOpenRosModal={() => setIsRosModalOpen(true)}
          isRosModalOpen={isRosModalOpen}
          onCloseRosModal={() => setIsRosModalOpen(false)}
          rosStatus={rosStatus}
        />
      </div>
    </div>
  );
}

