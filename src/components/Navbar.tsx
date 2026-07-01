import { LayoutDashboard, Leaf, Award, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export type TabType = 'dashboard' | 'tracking' | 'quality' | 'settings';

interface NavbarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function Navbar({ activeTab, onChangeTab }: NavbarProps) {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracking' as TabType, label: 'Tracking', icon: Leaf },
    { id: 'quality' as TabType, label: 'Quality', icon: Award },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_16px_rgba(21,66,18,0.04)] px-4 py-3 pb-safe max-w-7xl mx-auto rounded-t-2xl">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 focus:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              
              <div
                className={`relative z-10 flex flex-col items-center gap-0.5 transition-colors duration-200 ${
                  isActive ? 'text-white font-medium px-2' : 'text-text-muted hover:text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-105' : 'scale-100'} transition-transform duration-200`} />
                <span className="text-[10px] font-bold uppercase tracking-wider font-sans">
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
