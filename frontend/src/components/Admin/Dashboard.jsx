import React, { useState } from 'react';
import DailyReport from './DailyReport.jsx';
import UserReport from './UserReport.jsx';
import WordManagement from './WordManagement.jsx';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const tabs = [
    { id: 'daily', label: 'Daily Report', component: DailyReport },
    { id: 'user', label: 'User Report', component: UserReport },
    { id: 'words', label: 'Manage Words', component: WordManagement }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default Dashboard;
