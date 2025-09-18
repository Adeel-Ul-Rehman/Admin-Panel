import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Admin = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: isSidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 z-50 w-64 h-full bg-gradient-to-b from-black to-gray-900 border-r border-orange-600 shadow-2xl md:translate-x-0"
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-sky-100">Admin Dashboard</h2>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate('/admin')}
                className="w-full px-4 py-2 text-left text-sm text-sky-100 hover:bg-gray-800 hover:text-orange-400 rounded-lg transition-all duration-300"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/admin/list')}
                className="w-full px-4 py-2 text-left text-sm text-sky-100 hover:bg-gray-800 hover:text-orange-400 rounded-lg transition-all duration-300"
              >
                Product List
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/admin/add')}
                className="w-full px-4 py-2 text-left text-sm text-sky-100 hover:bg-gray-800 hover:text-orange-400 rounded-lg transition-all duration-300"
              >
                Add Product
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/admin/orders')}
                className="w-full px-4 py-2 text-left text-sm text-sky-100 hover:bg-gray-800 hover:text-orange-400 rounded-lg transition-all duration-300"
              >
                Orders
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/admin/profile')}
                className="w-full px-4 py-2 text-left text-sm text-sky-100 hover:bg-gray-800 hover:text-orange-400 rounded-lg transition-all duration-300"
              >
                Profile
              </button>
            </li>
          </ul>
        </nav>
      </motion.aside>

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-black to-gray-900 border-b border-orange-600 shadow-md h-16">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className="md:hidden text-sky-100 focus:outline-none"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-sky-100">Bookstore Admin</h1>
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:ml-64 overflow-y-auto">
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Admin;