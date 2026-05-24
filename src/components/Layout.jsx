import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar now receives the state and toggle function */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64 print:ml-0">
        
        {/* Mobile Top Navigation Bar (Hidden on Desktop & Print) */}
        <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-30 print:hidden shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-blue-600">Travel CRM</h1>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Dynamic Main Content Area */}
        {/* Padding scales from small (p-4) on phones to large (p-8) on desktops */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full print:p-0">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default Layout;