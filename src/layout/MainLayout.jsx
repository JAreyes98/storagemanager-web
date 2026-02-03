import React from 'react';
import { LayoutDashboard, Database, ShieldAlert, Settings, FolderTree } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link to={path} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
    active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const MainLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 p-6 space-y-8 flex-shrink-0">
        <div className="flex items-center space-x-3 px-2">
          <div className="bg-blue-500 p-2 rounded-lg">
            <FolderTree size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">HC-Storage</span>
        </div>

        <nav className="space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" active={location.pathname === '/'} />
          <SidebarItem icon={Database} label="Buckets" path="/buckets" active={location.pathname === '/buckets'} />
          <SidebarItem icon={Settings} label="Apps Management" path="/apps" active={location.pathname === '/apps'} />
          <SidebarItem icon={ShieldAlert} label="Security" path="/security" active={location.pathname === '/security'} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <span className="text-slate-400 text-sm font-medium">Network: API-Gateway (8080)</span>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Admin Session</p>
              <p className="text-sm font-semibold">jdreyes</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              JD
            </div>
          </div>
        </header>
        <div className="max-w-100x1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;