import { useState } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import { Outlet } from 'react-router-dom';
const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen flex flex-col ">
      <div className='p-2'>
        <Navbar/>
      </div>
      <div className="flex flex-grow overflow">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />

        {/* Main Content */}
        <div className="flex-grow p-4 rounded-md shadow-md overflow-y-auto  dark:bg-[#081424]">
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;