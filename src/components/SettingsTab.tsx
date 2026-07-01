import React, { useState } from 'react';
import { 
  User, Radio, Lightbulb, BellRing, Gauge, ChevronDown, ChevronRight,
  Trash2, ShieldAlert, RefreshCw, CheckCircle2, LogOut, Shield, HelpCircle,
  ExternalLink, Cpu, Crown, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DeviceManagementTab from './DeviceManagementTab';

interface SettingsTabProps {
  onResetData: () => void;
  userEmail: string;
  isSupabaseConfigured: boolean;
  onLogout: () => void;
  zonesCount?: number;
}

export default function SettingsTab({ 
  onResetData, 
  userEmail, 
  isSupabaseConfigured, 
  onLogout,
  zonesCount = 8
}: SettingsTabProps) {
  // Settings States
  const [gatewayEnabled, setGatewayEnabled] = useState(true);
  const [ledSpectrum, setLedSpectrum] = useState('full-spectrum');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [lowPhThreshold, setLowPhThreshold] = useState(5.5);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  
  // Section toggle state
  const [activeSection, setActiveSection] = useState<'iot' | 'devices' | 'notifications' | 'telemetry' | 'recovery' | null>(null);

  // Status message states
  const [isResetting, setIsResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const toggleSection = (section: 'iot' | 'devices' | 'notifications' | 'telemetry' | 'recovery') => {
    setActiveSection(prev => prev === section ? null : section);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleResetClick = () => {
    setIsResetting(true);
    setTimeout(() => {
      onResetData();
      setIsResetting(false);
      setActiveSection(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-28">
      
      {/* Header: User Profile */}
      <section className="flex flex-col items-center text-center space-y-4 pt-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              alt="Alex Rivers portrait"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqp1NdHOKu8y1Rf9A_TeHenvoNffu5hg2ILUHazKlV-2GI1fNXi_JaywBJu--d5nVfYKz9_voUxLdfYI8k_0J1qswWr6INw7msy84uBJdvjXqsFC0JpNsKEgYjA8wMeI8ayxvYauPYqYE5fR70Cc2sSLl04XTzOiAqKVJnQg_TjxxPFIz1v-tXhwr1u5LWRvHqDSQJwiU1VUYDz_abu-YJSpWmjkVJOSadD-VdzEXyoehr1cgkYuzKuzix9zxX_1363P50N9gR9xX_" 
            />
          </div>
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#BCF0AE] rounded-full border-2 border-white flex items-center justify-center shadow-md">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-xl font-black text-text-dark tracking-tight">Alex Rivers</h2>
          <p className="text-xs text-text-muted font-bold">Lead Agronomist</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
            <span className="text-[10px] font-black text-primary tracking-wider uppercase">System Status: Online</span>
          </div>
        </div>
      </section>

      {/* Farm Stats Card (Glassmorphic) */}
      <section className="glass-card rounded-2xl p-5 grid grid-cols-3 gap-2 border border-white/80">
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1">HARVESTS</span>
          <span className="text-sm font-black text-primary font-mono">142</span>
        </div>
        <div className="flex flex-col items-center text-center border-x border-gray-100">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1">AVG. PURITY</span>
          <span className="text-sm font-black text-primary font-mono">99.4%</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1">ZONES</span>
          <span className="text-sm font-black text-primary font-mono">{zonesCount}</span>
        </div>
      </section>

      {/* Subscription Details */}
      <section className="glass-card rounded-2xl p-5 border border-white/80 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-text-dark flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" /> Enterprise Plan
            </h3>
            <p className="text-[11px] text-text-muted">Advanced IoT &amp; AI Insights</p>
          </div>
          <div className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase">
            ACTIVE
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-text-muted">Renews Oct 2026</span>
          <button 
            type="button"
            onClick={() => alert("Subscription details and invoicing are managed by the billing group at enterprise@growsmart.io.")}
            className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer active:scale-95 duration-150"
          >
            MANAGE PLAN
          </button>
        </div>
      </section>

      {/* Settings list header */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider px-1">SYSTEM CONFIGURATION</h4>
        
        <div className="glass-card rounded-2xl divide-y divide-gray-100 border border-white/80 overflow-hidden">
          
          {/* Section 1: IoT Gateway Settings */}
          <div className="w-full">
            <button 
              type="button"
              onClick={() => toggleSection('iot')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-dark">IoT Gateway Settings</span>
              </div>
              {activeSection === 'iot' ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )}
            </button>
            
            <AnimatePresence>
              {activeSection === 'iot' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-gray-50/50 px-4 pb-4 border-t border-gray-100/50"
                >
                  <form onSubmit={handleSaveSettings} className="space-y-4 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-text-dark block">IoT Telemetry Link</span>
                        <span className="text-[10px] text-text-muted leading-tight block">
                          Broadcast real-time sensor parameters to global cloud relay.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGatewayEnabled(!gatewayEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                          gatewayEnabled ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          gatewayEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-dark flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-primary" /> Active Spectrum Profile
                      </label>
                      <select
                        value={ledSpectrum}
                        onChange={(e) => setLedSpectrum(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                      >
                        <option value="full-spectrum">Full Spectrum (Optimized Biomass)</option>
                        <option value="veg-dominant">Veg-Dominant Blue (Leaf Growth)</option>
                        <option value="flowering-red">Flowering-Dominant Red (Fruit Yield)</option>
                        <option value="germination">Warm White (Germination & Seedlings)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-primary hover:bg-primary-light text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      {saveSuccess ? 'Config Updated' : 'Save Configuration'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 1b: Device Pairing & Management */}
          <div className="w-full">
            <button 
              type="button"
              onClick={() => toggleSection('devices')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-text-dark">Paired Devices &amp; Hardware</span>
              </div>
              {activeSection === 'devices' ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )}
            </button>
            
            <AnimatePresence>
              {activeSection === 'devices' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-gray-50/50 px-4 pb-4 border-t border-gray-100/50"
                >
                  <div className="pt-3">
                    <DeviceManagementTab userEmail={userEmail} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Notification Preferences */}
          <div className="w-full">
            <button 
              type="button"
              onClick={() => toggleSection('notifications')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <BellRing className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-dark">Notification Preferences</span>
              </div>
              {activeSection === 'notifications' ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )}
            </button>

            <AnimatePresence>
              {activeSection === 'notifications' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-gray-50/50 px-4 pb-4 border-t border-gray-100/50"
                >
                  <form onSubmit={handleSaveSettings} className="space-y-3 pt-3">
                    <label className="flex items-start gap-2.5 py-1.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={notifySms}
                        onChange={(e) => setNotifySms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="-mt-0.5">
                        <span className="text-xs font-bold text-text-dark block">SMS Critical Alerts</span>
                        <span className="text-[10px] text-text-muted block">Immediate delivery of critical system shutdowns.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 py-1.5 border-t border-gray-100/50 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="-mt-0.5">
                        <span className="text-xs font-bold text-text-dark block">Email Analytics Digest</span>
                        <span className="text-[10px] text-text-muted block">Weekly telemetry summaries and certification updates.</span>
                      </div>
                    </label>

                    <button
                      type="submit"
                      className="w-full py-2 bg-primary hover:bg-primary-light text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 mt-2"
                    >
                      {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      {saveSuccess ? 'Preferences Saved' : 'Save Preferences'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 3: Telemetry & Calibration */}
          <div className="w-full">
            <button 
              type="button"
              onClick={() => toggleSection('telemetry')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <Sliders className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-dark">Calibration & Thresholds</span>
              </div>
              {activeSection === 'telemetry' ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )}
            </button>

            <AnimatePresence>
              {activeSection === 'telemetry' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-gray-50/50 px-4 pb-4 border-t border-gray-100/50"
                >
                  <form onSubmit={handleSaveSettings} className="space-y-4 pt-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-text-dark">Minimum Safe pH limit</span>
                        <span className="font-mono font-extrabold text-primary">{lowPhThreshold.toFixed(1)} pH</span>
                      </div>
                      <input 
                        type="range" 
                        min="5.0" 
                        max="6.5" 
                        step="0.1"
                        value={lowPhThreshold}
                        onChange={(e) => setLowPhThreshold(Number(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100/50">
                      <span className="text-xs font-bold text-text-dark">Unit System</span>
                      <div className="bg-gray-100 p-0.5 rounded-lg flex gap-1">
                        <button
                          type="button"
                          onClick={() => setTempUnit('C')}
                          className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${
                            tempUnit === 'C' ? 'bg-white text-primary shadow-sm' : 'text-text-muted'
                          }`}
                        >
                          °C (Metric)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempUnit('F')}
                          className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${
                            tempUnit === 'F' ? 'bg-white text-primary shadow-sm' : 'text-text-muted'
                          }`}
                        >
                          °F (Imperial)
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-primary hover:bg-primary-light text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      {saveSuccess ? 'Thresholds Saved' : 'Save Calibration'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 4: Security & Recovery */}
          <div className="w-full">
            <button 
              type="button"
              onClick={() => toggleSection('recovery')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-dark">Security &amp; Privacy</span>
              </div>
              {activeSection === 'recovery' ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )}
            </button>

            <AnimatePresence>
              {activeSection === 'recovery' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-gray-50/50 px-4 pb-4 border-t border-gray-100/50"
                >
                  <div className="space-y-3 pt-3">
                    <p className="text-[10px] text-text-muted leading-relaxed">
                      Your cultivation portal is cryptographically secured. You are logged in with credential token scoped to <span className="font-bold text-text-dark">{userEmail}</span>.
                    </p>
                    
                    <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-2">
                      <span className="text-[10px] font-black text-red-800 uppercase tracking-wider flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Diagnostic Database Reset
                      </span>
                      <p className="text-[10px] text-red-900 leading-normal">
                        Erasing user telemetry database resets all custom logs, weekly journal notes, and cultivation modules.
                      </p>
                      
                      <button
                        type="button"
                        onClick={handleResetClick}
                        disabled={isResetting}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isResetting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Purging telemetry logs...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" /> Purge Scoped Databases
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Support Section */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider px-1">SUPPORT</h4>
        
        <div className="glass-card rounded-2xl divide-y divide-gray-100 border border-white/80 overflow-hidden">
          <button 
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors text-left focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-text-dark">Help Center</span>
            </div>
            <ExternalLink className="w-4 h-4 text-text-muted" />
          </button>

          <button 
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50/40 transition-colors text-left focus:outline-none cursor-pointer group"
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider">Sign Out</span>
            </div>
          </button>
        </div>
      </div>

      {/* Support / Help Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowSupportModal(false)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 border border-gray-100 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <HelpCircle className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-black text-text-dark">Grow Smart Support Desk</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  The complete biosphere handbook and troubleshooting indexes are pre-loaded in your gateway hardware memory. For advanced biological questions or live field assistance, contact our network:
                </p>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest block">TELEPHONE DISPATCH</span>
                <span className="text-xs font-black text-text-dark block">+1 (800) GROW-SMART</span>
                <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest block mt-2">SECURE EMAIL HELPDESK</span>
                <span className="text-xs font-black text-primary block">support@growsmart.io</span>
              </div>

              <button 
                onClick={() => setShowSupportModal(false)}
                className="w-full py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-black uppercase tracking-wider rounded-xl shadow cursor-pointer text-center"
              >
                Dismiss
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
