'use client';

import { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/DashboardView';
import ValenciaTab from '@/components/ValenciaTab';
import TrovvaTab from '@/components/TrovvaTab';
import DelvRaiTab from '@/components/DelvRaiTab';
import WhiteboardTab from '@/components/WhiteboardTab';
import SettingsTab from '@/components/SettingsTab';
import { BusinessData } from '@/lib/types';
import { daysUntilGoal } from '@/lib/dateUtils';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<BusinessData | null>(null);
  const [daysToGoal, setDaysToGoal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from API
    const loadData = async () => {
      try {
        const response = await fetch('/api/data');
        const businessData = await response.json();
        setData(businessData);
        setDaysToGoal(daysUntilGoal());
      } catch (error) {
        console.error('Failed to load data:', error);
        // Set default data
        setData({
          valencia: {
            status: 'In Progress',
            clients: 0,
            revenue: 0,
            progressPercent: 0,
            nextMilestone: 'Get 1st consultation (Feb 28)',
          },
          trovva: {
            status: 'Pre-Launch',
            followers: 0,
            revenue: 0,
            progressPercent: 0,
            nextMilestone: 'Launch Monday, March 1',
            launchDate: 'March 1, 2026',
          },
          delvrai: {
            status: 'Planning',
            clients: 0,
            revenue: 0,
            progressPercent: 0,
            nextMilestone: '10 clients by April',
          },
          totalFollowers: 0,
          totalRevenue: 0,
          targetMonthly: 25000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-neon-green text-xl">Loading Mission Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          totalFollowers={data.totalFollowers}
          totalRevenue={data.totalRevenue}
          targetMonthly={data.targetMonthly}
          daysToGoal={daysToGoal}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl">
            {activeTab === 'dashboard' && <DashboardView data={data} daysToGoal={daysToGoal} />}
            {activeTab === 'valencia' && <ValenciaTab data={data} />}
            {activeTab === 'trovva' && <TrovvaTab data={data} />}
            {activeTab === 'delvrai' && <DelvRaiTab data={data} />}
            {activeTab === 'whiteboard' && <WhiteboardTab />}
            {activeTab === 'settings' && <SettingsTab data={data} />}
          </div>
        </main>
      </div>
    </div>
  );
}
