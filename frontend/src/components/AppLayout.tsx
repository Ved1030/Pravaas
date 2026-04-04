import { useState } from 'react';
import { LayoutDashboard, Route, Map, AlertTriangle, User, Bell, UserPlus, LogIn, GitCompare, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardScreen from '@/components/screens/DashboardScreen';
import PlannerScreen from '@/components/screens/PlannerScreen';
import LiveMapScreen from '@/components/screens/LiveMapScreen';
import DisruptionsScreen from '@/components/screens/DisruptionsScreen';
import HistoryScreen from '@/components/screens/HistoryScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import RouteComparisonScreen from '@/components/screens/RouteComparisonScreen';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'planner', icon: Route, label: 'Planner' },
  { id: 'map', icon: Map, label: 'Live Map' },
  { id: 'comparison', icon: GitCompare, label: 'Compare' },
  { id: 'alerts', icon: AlertTriangle, label: 'Disruptions' },
  { id: 'history', icon: History, label: 'History' },
  { id: 'profile', icon: User, label: 'Profile' },
];

const AppLayout = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard': return <DashboardScreen onNavigate={setActiveScreen} />;
      case 'planner': return <PlannerScreen />;
      case 'map': return <LiveMapScreen />;
      case 'comparison': return <RouteComparisonScreen />;
      case 'alerts': return <DisruptionsScreen />;
      case 'history': return <HistoryScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <DashboardScreen onNavigate={setActiveScreen} />;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#f9f8f2] font-finflow">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] min-h-screen bg-white border-r border-[#e5e5e5] fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="p-7 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm border border-gray-100 flex items-center justify-center transition-transform hover:scale-105">
            <img src="/logo3.png" alt="FlowCity Logo" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#1b3a2a] to-[#2c5f45] bg-clip-text text-transparent">
            FlowCity
          </h1>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-[#1b3a2a] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={17}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-normal'}`}>{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c5f02c] shadow-[0_0_8px_rgba(197,240,44,0.5)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 mt-auto">
          <div className="bg-[#f8f9f5] rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Alex Piter</h4>
                </div>
              </div>
              <Bell size={15} className="text-gray-400" />
            </div>

            <div className="flex flex-col gap-2">
              <button className="w-full flex items-center justify-center gap-2 bg-[#c5f02c] text-[#1d2921] font-bold py-2.5 rounded-xl hover:bg-[#b5e025] transition-colors shadow-sm text-sm">
                <UserPlus size={16} strokeWidth={2.5} />
                Sign Up
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition-colors shadow-sm text-sm">
                <LogIn size={16} strokeWidth={2.5} />
                Login
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[260px] pb-20 lg:pb-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="min-h-screen p-6 lg:p-8"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex overflow-x-auto hide-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={`min-w-[56px] flex-1 flex flex-col items-center justify-center py-3 relative transition-colors ${
              activeScreen === item.id ? 'text-[#1b3a2a]' : 'text-gray-400'
            }`}
          >
            {activeScreen === item.id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#1b3a2a] rounded-b-full" />
            )}
            <item.icon size={18} strokeWidth={activeScreen === item.id ? 2.5 : 2} />
            <span className={`text-[9px] mt-1 whitespace-nowrap ${activeScreen === item.id ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
