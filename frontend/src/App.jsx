import { useState } from 'react';
import Sidebar from './components/Sidebar';
import RepositoryPage from './pages/RepositoryPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  // FIX: Default to 'repository' instead of 'reports'
  const [currentPage, setCurrentPage] = useState('repository');

  return (
    <div className="flex h-screen bg-dark-bg text-gray-200 font-sans overflow-hidden">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {currentPage === 'repository' && <RepositoryPage />}
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'reports' && <ReportsPage />}
        </div>
      </main>
    </div>
  );
}