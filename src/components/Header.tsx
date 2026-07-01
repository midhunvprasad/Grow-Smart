import { Sprout, Bell, Circle } from 'lucide-react';

interface HeaderProps {
  onNotificationClick: () => void;
  unreadNotificationsCount: number;
}

export default function Header({ onNotificationClick, unreadNotificationsCount }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Sprout className="w-5 h-5 text-primary" />
            <span className="font-serif text-sm tracking-tight text-primary-light">agriculture</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary -mt-1 font-sans">Grow Smart</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Connection status indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="text-[10px] font-bold tracking-wider text-primary uppercase">ONLINE</span>
        </div>
        
        {/* Notification bell */}
        <button 
          id="btn-notifications"
          onClick={onNotificationClick}
          className="relative p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200 active:scale-95"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
