import { useState, useEffect } from 'react';
import { 
  loadData, saveData, INITIAL_ZONES, 
  INITIAL_ALERTS, INITIAL_JOURNAL_ENTRIES, INITIAL_CERTIFICATE 
} from './data';
import { Zone, Alert, JournalEntry } from './types';
import Header from './components/Header';
import Navbar, { TabType } from './components/Navbar';
import DashboardTab from './components/DashboardTab';
import TrackingTab from './components/TrackingTab';
import QualityTab from './components/QualityTab';
import SettingsTab from './components/SettingsTab';
import AuthScreen from './components/AuthScreen';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, BellRing, Info } from 'lucide-react';
import { 
  isSupabaseConfigured, getZones, upsertZone, 
  getJournalEntries, upsertJournalEntry, deleteJournalEntryDb, 
  getAlerts, upsertAlert, supabase 
} from './supabase';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<{ email: string; isMock: boolean } | null>(() => {
    const cached = localStorage.getItem('growsmart_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Helper to load user-scoped data or start blank
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    const cachedUser = localStorage.getItem('growsmart_user');
    if (cachedUser) {
      try {
        const u = JSON.parse(cachedUser);
        if (u && u.email) {
          return loadData(`${u.email}_${key}`, defaultValue);
        }
      } catch {
        // Fall through
      }
    }
    return defaultValue;
  };

  // Load state from local storage or start blank if logged in
  const [zones, setZones] = useState<Zone[]>(() => getInitialState<Zone[]>('zones', []));
  const [alerts, setAlerts] = useState<Alert[]>(() => getInitialState<Alert[]>('alerts', []));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => getInitialState<JournalEntry[]>('journal_entries', []));
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-1');
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<string[]>(() => [
    'System initialization successful. Multi-spectrum LEDs online.',
    'IoT Gateway secured. Continuous telemetry feed active.'
  ]);

  const handleLoginSuccess = (email: string, isMock: boolean) => {
    const userData = { email, isMock };
    setUser(userData);
    localStorage.setItem('growsmart_user', JSON.stringify(userData));
    
    // Load their specific data immediately upon login, default to blank
    const userZones = loadData(`${email}_zones`, []);
    const userAlerts = loadData(`${email}_alerts`, []);
    const userJournals = loadData(`${email}_journal_entries`, []);
    
    setZones(userZones);
    setAlerts(userAlerts);
    setJournalEntries(userJournals);

    setNotificationLogs(prev => [
      `Authenticated successfully as agronomist: ${email}`,
      ...prev
    ]);
  };

  const handleLogout = async () => {
    localStorage.removeItem('growsmart_user');
    setUser(null);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setZones([]);
    setAlerts([]);
    setJournalEntries([]);
    setNotificationLogs([
      'Agronomist logged out. Secured biosphere connection.'
    ]);
  };

  // Synchronize with Supabase as soon as the user is available or logs in
  useEffect(() => {
    async function syncWithSupabase() {
      if (!user) return;

      if (isSupabaseConfigured) {
        setNotificationLogs(prev => [
          'Initial sync: Establishing connection with Supabase backend...',
          ...prev
        ]);
        try {
          const remoteZones = await getZones(zones);
          const remoteJournal = await getJournalEntries(journalEntries);
          const remoteAlerts = await getAlerts(alerts);

          setZones(remoteZones);
          setJournalEntries(remoteJournal);
          setAlerts(remoteAlerts);

          setNotificationLogs(prev => [
            'Live Sync Success: Loaded up-to-date data structures from Supabase tables!',
            ...prev
          ]);
        } catch (err) {
          console.error('Supabase initialization sync failed:', err);
          setNotificationLogs(prev => [
            'Sync Warn: Could not connect to Supabase tables. Using local cache.',
            ...prev
          ]);
        }
      } else {
        setNotificationLogs(prev => [
          'Client running in Local mode. Define Supabase Secrets to sync to database.',
          ...prev
        ]);
      }
    }
    syncWithSupabase();
  }, [user?.email]);

  // Sync state to local storage when changed (for continuous user-friendly backup)
  useEffect(() => {
    if (user) {
      saveData(`${user.email}_zones`, zones);
    }
  }, [zones, user?.email]);

  useEffect(() => {
    if (user) {
      saveData(`${user.email}_alerts`, alerts);
    }
  }, [alerts, user?.email]);

  useEffect(() => {
    if (user) {
      saveData(`${user.email}_journal_entries`, journalEntries);
    }
  }, [journalEntries, user?.email]);

  // Handler for dismissing alert
  const handleDismissAlert = (alertId: string) => {
    // Set alerts active to false
    setAlerts(prev => {
      const updated = prev.map(a => a.id === alertId ? { ...a, active: false } : a);
      const affected = updated.find(a => a.id === alertId);
      if (affected) {
        upsertAlert(affected);
      }
      return updated;
    });
    
    // Dynamically heal Zone 4 to "Healthy" state when alert is closed
    setZones(prev => {
      const updated = prev.map(z => {
        if (z.id === 'zone-4') {
          const val: Zone = { 
            ...z, 
            status: 'Healthy', 
            pH: 6.2, // restore to optimal pH
            history: {
              ...z.history,
              pH: [...z.history.pH.slice(0, -1), 6.2] // update last value to healthy
            }
          };
          upsertZone(val);
          return val;
        }
        return z;
      });
      return updated;
    });

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
    setAlerts(prev => {
      const updated = prev.map(a => a.id === 'alert-1' ? { ...a, active: true } : a);
      const affected = updated.find(a => a.id === 'alert-1');
      if (affected) {
        upsertAlert(affected);
      }
      return updated;
    });
    
    // Set Zone 4 back to Warning state with drop in pH
    setZones(prev => {
      const updated = prev.map(z => {
        if (z.id === 'zone-4') {
          const val: Zone = { 
            ...z, 
            status: 'Warning', 
            pH: 5.4, // drop pH back
            history: {
              ...z.history,
              pH: [...z.history.pH, 5.4]
            }
          };
          upsertZone(val);
          return val;
        }
        return z;
      });
      return updated;
    });

    setNotificationLogs(prev => [
      `System Simulator triggered low pH event in Lettuce Unit (Zone 4).`,
      ...prev
    ]);
  };

  // Handler for adding new Zone
  const handleAddZone = (newZone: Zone) => {
    setZones(prev => [...prev, newZone]);
    upsertZone(newZone);
    setNotificationLogs(prev => [
      `Cultivation expansion: Established ${newZone.name} holding ${newZone.crop}.`,
      ...prev
    ]);
  };

  // Handler for updating existing Zone
  const handleUpdateZone = (updatedZone: Zone) => {
    setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
    upsertZone(updatedZone);
    setNotificationLogs(prev => [
      `Telemetry updated: Calibrated sensors for ${updatedZone.name}.`,
      ...prev
    ]);
  };

  // Handler for adding weekly journal entry
  const handleAddJournalEntry = (newEntry: JournalEntry) => {
    setJournalEntries(prev => [newEntry, ...prev]);
    upsertJournalEntry(newEntry);
    setNotificationLogs(prev => [
      `Journal entry logged: Week ${newEntry.week} evaluation recorded successfully.`,
      ...prev
    ]);
  };

  // Handler for deleting custom journal entry
  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
    deleteJournalEntryDb(id);
    setNotificationLogs(prev => [
      `Journal log removed from cultivation database.`,
      ...prev
    ]);
  };

  // Factory default reset
  const handleResetData = () => {
    if (user) {
      localStorage.removeItem(`growsmart_${user.email}_zones`);
      localStorage.removeItem(`growsmart_${user.email}_alerts`);
      localStorage.removeItem(`growsmart_${user.email}_journal_entries`);
    } else {
      localStorage.removeItem('growsmart_zones');
      localStorage.removeItem('growsmart_alerts');
      localStorage.removeItem('growsmart_journal_entries');
    }
    setZones([]);
    setAlerts([]);
    setJournalEntries([]);
    setSelectedZoneId('zone-1');
    setNotificationLogs([
      'All local and user-scoped telemetry databases have been safely cleared.'
    ]);
  };

  // Filter out active alerts for the header notification count
  const unreadNotificationsCount = alerts.filter(a => a.active).length;

  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

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
                  onChangeTab={setActiveTab}
                />
              )}

              {activeTab === 'tracking' && (
                <TrackingTab 
                  zones={zones}
                  onAddZone={handleAddZone}
                  onUpdateZone={handleUpdateZone}
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
                  userEmail={user.email}
                  isSupabaseConfigured={isSupabaseConfigured}
                  onLogout={handleLogout}
                  zonesCount={zones.length}
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
