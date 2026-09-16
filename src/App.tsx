import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { ClientsView } from './components/ClientsView';
import { ServicesView } from './components/ServicesView';
import { WorkingHoursView } from './components/WorkingHoursView';
import { RemindersView } from './components/RemindersView';
import { ReportsView } from './components/ReportsView';
import { AuthView } from './components/AuthView';
import { ClientPortalView } from './components/ClientPortalView';
import { AppointmentModal } from './components/AppointmentModal';
import { ToastContainer } from './components/ToastContainer';

const MainLayout: React.FC = () => {
  const { session, activeTab, appMode } = useApp();

  // If in client portal mode, show client booking experience directly
  if (appMode === 'client') {
    return (
      <>
        <ClientPortalView />
        <ToastContainer />
      </>
    );
  }

  // If admin is not logged in, show login & registration
  if (!session.isLoggedIn) {
    return (
      <>
        <AuthView />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#edcae5] text-stone-900 flex flex-col selection:bg-rose-100 selection:text-rose-900 pb-28 md:pb-8">
      {/* Top Navbar */}
      <Navbar />

      <div className="max-w-7xl w-full mx-auto flex-1 flex">
        {/* Desktop Sidebar */}
        <Navigation />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'clients' && <ClientsView />}
          {activeTab === 'services' && <ServicesView />}
          {activeTab === 'schedule' && <WorkingHoursView />}
          {activeTab === 'reminders' && <RemindersView />}
          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <AppointmentModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
