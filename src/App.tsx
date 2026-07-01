import { useState, useEffect } from 'react';
import { 
  loadData, saveData, INITIAL_ZONES, INITIAL_METRICS, 
  INITIAL_ALERTS, INITIAL_JOURNAL_ENTRIES, INITIAL_CERTIFICATE 
} from './data';
import { Zone, Alert, JournalEntry, Certificate } from './types';
import Header from './components/Header';
import Navbar, { TabType } from './components/Navbar';
import DashboardTab from './components/DashboardTab';
import TrackingTab from './components/TrackingTab';
import QualityTab from './components/QualityTab';
import SettingsTab from './components/SettingsTab';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, BellRing, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Load state from local storage or defaults
  const [zones, setZones] = useState<Zone[]>(() => loadData('zones', INITIAL_ZONES));
  const [alerts, setAlerts] = useState<Alert[]>(() => loadData('alerts', INITIAL_ALERTS));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => loadData('journal_entries', INITIAL_JOURNAL_ENTRIES));
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-1');
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<string[]>(() => [
    'System initialization successful. Multi-spectrum LEDs online.',
    'IoT Gateway secured. Continuous telemetry feed active.',
    'Urgent alert: pH imbalance detected in Lettuce module (Zone 4).'
  ]);

  // Sync state to local storage when changed
  useEffect(() => {
    saveData('zones', zones);
  }, [zones]);

  useEffect(() => {
    saveData('alerts', alerts);
  }, [alerts]);

  useEffect(() => {
    saveData('journal_entries', journalEntries);
  }, [journalEntries]);

  // Handler for dismissing alert
  const handleDismissAlert = (alertId: string) => {
    // Set alerts active to false
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, active: false } : a));
    
    // Dynamically heal Zone 4 to "Healthy" state when alert is closed
    setZones(prev => prev.map(z => {
      if (z.id === 'zone-4') {
        return { 
          ...z, 
          status: 'Healthy', 
          pH: 6.2, // restore to optimal pH
          history: {
            ...z.history,
            pH: [...z.history.pH.slice(0, -1), 6.2] // update last value to healthy
          }
        };
      }
      return z;
    }));

    // Add logging notification
    setNotificationLogs(prev => [
      `User cleared pH alert. Zone 4 Lettuce restored to automated pH balance.`,
      ...prev
    ]);
  };

  // Handler for triggering pH imbalance simulation alert
  const handleTriggerAlert = () => {
    const hasActiveAlert = alerts.some(a => a.id === 'alert-1' && a.active);
    if (hasActiveAlert) return;

    // Reactivate alert
    setAlerts(prev => prev.map(a => a.id === 'alert-1' ? { ...a, active: true } : a));
    
    // Set Zone 4 back to Warning state with drop in pH
    setZones(prev => prev.map(z => {
      if (z.id === 'zone-4') {
        return { 
          ...z, 
          status: 'Warning', 
          pH: 5.4, // drop pH back
          history: {
            ...z.history,
            pH: [...z.history.pH, 5.4]
          }
        };
      }
      return z;
    }));

    setNotificationLogs(prev => [
      `System Simulator triggered low pH event in Lettuce Unit (Zone 4).`,
      ...prev
    ]);
  };

  // Handler for adding new Zone
  const handleAddZone = (newZone: Zone) => {
    setZones(prev => [...prev, newZone]);
    setNotificationLogs(prev => [
      `Cultivation expansion: Established ${newZone.name} holding ${newZone.crop}.`,
      ...prev
    ]);
  };

  // Handler for adding weekly journal entry
  const handleAddJournalEntry = (newEntry: JournalEntry) => {
    setJournalEntries(prev => [newEntry, ...prev]);
    setNotificationLogs(prev => [
      `Journal entry logged: Week ${newEntry.week} evaluation recorded successfully.`,
      ...prev
    ]);
  };

  // Handler for deleting custom journal entry
  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
    setNotificationLogs(prev => [
      `Journal log removed from cultivation database.`,
      ...prev
    ]);
  };

  // Factory default reset
  const handleResetData = () => {
    localStorage.removeItem('growsmart_zones');
    localStorage.removeItem('growsmart_alerts');
    localStorage.removeItem('growsmart_journal_entries');
    setZones(INITIAL_ZONES);
    setAlerts(INITIAL_ALERTS);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    setSelectedZoneId('zone-1');
    setNotificationLogs([
      'Database restored to master factory defaults successfully.',
      'Aero-root networks and multi-spectrum arrays re-initialized.'
    ]);
  };

  // Filter out active alerts for the header notification count
  const unreadNotificationsCount = alerts.filter(a => a.active).length;

  return (
    <div className="min-h-screen bg-[#f9faf2] text-text-dark font-sans flex flex-col antialiased">
      
      {/* Premium layout wrapper (centered phone mock frame for desktop, full screen on mobile) */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#f9faf2] flex flex-col relative shadow-[0_0_50px_rgba(21,66,18,0.05)] border-x border-gray-100">
        
        {/* Header App Bar */}
        <Header 
          onNotificationClick={() => setShowNotificationCenter(true)} 
          unreadNotificationsCount={unreadNotificationsCount}
        />

        {/* Dynamic Screen View container */}
        <main className="flex-1 mt-20 px-5 overflow-y-auto no-scrollbar pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {activeTab === 'dashboard' && (
                <DashboardTab 
                  zones={zones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                  alerts={alerts}
                  onDismissAlert={handleDismissAlert}
                  onAddZone={handleAddZone}
                  onTriggerAlert={handleTriggerAlert}
                />
              )}

              {activeTab === 'tracking' && (
                <TrackingTab 
                  journalEntries={journalEntries}
                  onAddJournalEntry={handleAddJournalEntry}
                  onDeleteJournalEntry={handleDeleteJournalEntry}
                />
              )}

              {activeTab === 'quality' && (
                <QualityTab 
                  initialCertificate={INITIAL_CERTIFICATE}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab 
                  onResetData={handleResetData}
                  userEmail="midhunvprasad@gmail.com"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Nav Bar */}
        <Navbar activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Dynamic Notification Drawer */}
        <AnimatePresence>
          {showNotificationCenter && (
            <div className="fixed inset-0 z-50 flex items-end justify-center px-4 bg-black/40 backdrop-blur-sm">
              {/* Tap background to close */}
              <div className="absolute inset-0" onClick={() => setShowNotificationCenter(false)} />
              
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 pb-8 z-10"
              >
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-text-dark flex items-center gap-1.5">
                    <BellRing className="w-5 h-5 text-primary" /> Active System Broadcasts
                  </h3>
                  <button 
                    onClick={() => setShowNotificationCenter(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-text-muted" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1 pt-1">
                  {/* Immediate Critical Alerts */}
                  {alerts.filter(a => a.active).map(alert => (
                    <div key={alert.id} className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-red-900">CRITICAL WARNING</p>
                        <p className="text-[11px] text-red-800 font-medium mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                  ))}

                  {/* Standard Information Logs */}
                  {notificationLogs.map((log, index) => (
                    <div key={index} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-2">
                      <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-text-muted leading-normal font-medium">
                        {log}
                      </p>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowNotificationCenter(false)}
                  className="w-full mt-5 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl shadow cursor-pointer text-center"
                >
                  Dismiss Console Logs
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
