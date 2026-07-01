import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, QrCode, Trash2, Radio, CheckCircle2, AlertTriangle, 
  RefreshCw, Camera, X, Play, Info, Sparkles, Wifi, WifiOff 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Device } from '../types';
import { supabase, insertDeviceDb, deleteDeviceDb, getDevices } from '../supabase';

interface DeviceManagementTabProps {
  userEmail: string;
}

export default function DeviceManagementTab({ userEmail }: DeviceManagementTabProps) {
  // Device list and local states
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form values
  const [deviceUid, setDeviceUid] = useState('');
  const [nickname, setNickname] = useState('');
  
  // UI Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Real-time status sync notification logs
  const [realtimeLogs, setRealtimeLogs] = useState<string[]>([]);

  // QR Scanner overlay state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraPermissionState, setCameraPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Load registered devices on mount
  const fetchDevices = async () => {
    setLoading(true);
    // Use local storage fallback if Supabase is offline or table is missing
    const localSaved = localStorage.getItem(`growsmart_devices_${userEmail}`);
    const fallbackList = localSaved ? JSON.parse(localSaved) : [
      { id: '1', device_uid: 'GS-SENSE-901', nickname: 'Zone 1 Core Soil Hub', status: 'online' },
      { id: '2', device_uid: 'GS-LED-402', nickname: 'Zone 2 Multi-Spectrum Array', status: 'offline' }
    ];

    try {
      const dbDevices = await getDevices(fallbackList);
      setDevices(dbDevices);
      localStorage.setItem(`growsmart_devices_${userEmail}`, JSON.stringify(dbDevices));
    } catch (err) {
      console.warn('Could not fetch devices from DB, using fallback list', err);
      setDevices(fallbackList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [userEmail]);

  // Real-time subscription to postgres_changes
  useEffect(() => {
    if (!supabase) {
      addRealtimeLog('Using Local Storage sync (Supabase client not active)');
      return;
    }

    addRealtimeLog('Activating Supabase Real-time listener...');

    const channel = supabase
      .channel('public:devices')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'devices'
        },
        (payload) => {
          console.log('[Real-time Change]', payload);
          const newId = (payload.new as any)?.id;
          const oldId = (payload.old as any)?.id;
          addRealtimeLog(`Received DB Event: ${payload.eventType.toUpperCase()} on ID ${newId || oldId || 'N/A'}`);
          
          // Re-fetch list to update all status indicators smoothly
          fetchDevices();
        }
      )
      .subscribe((status) => {
        addRealtimeLog(`Real-time state: ${status.toUpperCase()}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addRealtimeLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRealtimeLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 4)]);
  };

  // Form submission: register device
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceUid.trim() || !nickname.trim()) {
      setErrorMessage('Device UID and Nickname are required.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const newDevice: Omit<Device, 'id'> = {
      device_uid: deviceUid.trim(),
      nickname: nickname.trim(),
      status: 'online' // Default to online when paired
    };

    try {
      let registered: Device | null = null;
      if (supabase) {
        registered = await insertDeviceDb(newDevice);
      }

      // Fallback or local state handling
      if (!registered) {
        // Create an ID if local simulation
        const id = 'dev_' + Math.random().toString(36).substr(2, 9);
        registered = { id, ...newDevice };
      }

      const updatedList = [registered, ...devices];
      setDevices(updatedList);
      localStorage.setItem(`growsmart_devices_${userEmail}`, JSON.stringify(updatedList));
      
      setSuccessMessage(`Device "${nickname}" registered successfully!`);
      setDeviceUid('');
      setNickname('');
      
      addRealtimeLog(`Registered device: ${registered.device_uid}`);
    } catch (err: any) {
      console.error(err);
      // Even if database has error or table doesn't exist, allow simulated success for perfect prototyping
      const id = 'dev_' + Math.random().toString(36).substr(2, 9);
      const simulated: Device = { id, ...newDevice };
      const updatedList = [simulated, ...devices];
      setDevices(updatedList);
      localStorage.setItem(`growsmart_devices_${userEmail}`, JSON.stringify(updatedList));

      setSuccessMessage(`Registered successfully (Local Simulation Sync active)`);
      setDeviceUid('');
      setNickname('');
    } finally {
      setSubmitting(false);
    }
  };

  // Unpair/Delete device
  const handleUnpair = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to unpair "${name}"?`)) return;

    try {
      if (supabase) {
        await deleteDeviceDb(id);
      }
      
      const updatedList = devices.filter(d => d.id !== id);
      setDevices(updatedList);
      localStorage.setItem(`growsmart_devices_${userEmail}`, JSON.stringify(updatedList));
      addRealtimeLog(`Unpaired device ID: ${id}`);
    } catch (err) {
      console.error('Delete failed:', err);
      // local sync
      const updatedList = devices.filter(d => d.id !== id);
      setDevices(updatedList);
      localStorage.setItem(`growsmart_devices_${userEmail}`, JSON.stringify(updatedList));
    }
  };

  // Simulate a status change for testing real-time events!
  const toggleDeviceStatus = async (device: Device) => {
    const nextStatus = device.status === 'online' ? 'offline' : 'online';
    addRealtimeLog(`Simulating network event: ${device.nickname} going ${nextStatus.toUpperCase()}`);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('devices')
          .update({ status: nextStatus })
          .eq('id', device.id);
        
        if (error) throw error;
        // The postgres_changes subscription will catch this and refresh the list!
      } catch (err) {
        // Local mode fallback update
        const updatedList = devices.map(d => d.id === device.id ? { ...d, status: nextStatus } : d);
        setDevices(updatedList);
        localStorage.setItem(`growsmart_devices_${userEmail}`, JSON.stringify(updatedList));
      }
    } else {
      // Local mode fallback update
      const updatedList = devices.map(d => d.id === device.id ? { ...d, status: nextStatus } : d);
      setDevices(updatedList);
      localStorage.setItem(`growsmart_devices_${userEmail}`, JSON.stringify(updatedList));
    }
  };

  // QR CAMERA SCANNER LOGIC
  const openQrScanner = async () => {
    setIsScannerOpen(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermissionState('unsupported');
      return;
    }

    try {
      setCameraPermissionState('prompt');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      mediaStreamRef.current = stream;
      setCameraPermissionState('granted');
      
      // Assign video source after state updates
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraPermissionState('denied');
    }
  };

  const closeQrScanner = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsScannerOpen(false);
  };

  // Safe cleanup
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simulate a QR Code recognition
  const selectMockQrCode = (code: string, desc: string) => {
    setDeviceUid(code);
    if (!nickname) {
      setNickname(desc);
    }
    closeQrScanner();
    setSuccessMessage(`QR Code "${code}" scanned successfully! Nickname pre-filled.`);
  };

  return (
    <div className="space-y-4">
      
      {/* Device pairing form */}
      <section className="glass-card rounded-2xl p-5 border border-white/85 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-text-dark flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-primary" /> Register IoT Device
          </h3>
          
          <button
            type="button"
            id="btn-trigger-qr"
            onClick={openQrScanner}
            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary rounded-xl text-[10px] font-extrabold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            SCAN QR CAMERA
          </button>
        </div>

        {/* Messaging overlays */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-xl text-[11px] font-bold flex items-start gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[11px] font-bold flex items-start gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">
                Device UID (e.g. GS-SENSE-501)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  id="input-device-uid"
                  placeholder="Scan QR or enter serial UID"
                  value={deviceUid}
                  onChange={(e) => setDeviceUid(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={openQrScanner}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-light"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">
                Nickname
              </label>
              <input
                type="text"
                required
                id="input-device-nickname"
                placeholder="e.g. Zone 1 Soil Sensor Array"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

          </div>

          <button
            type="submit"
            id="btn-submit-device"
            disabled={submitting}
            className="w-full py-3 bg-primary hover:bg-primary-light text-white font-extrabold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Pairing with Gateway...
              </>
            ) : (
              <>
                Pair &amp; Authorize Device
              </>
            )}
          </button>
        </form>
      </section>

      {/* Registered device list container */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider px-1">
            PAIRED DEVISES &amp; HARDWARE ({devices.length})
          </h4>
          <button
            onClick={fetchDevices}
            className="p-1 hover:bg-primary/5 rounded-full text-text-muted hover:text-primary transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 bg-white/40 rounded-2xl border border-gray-100">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <p className="text-[11px] text-text-muted font-bold">Syncing IoT hardware roster...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="py-10 text-center bg-white/40 border border-dashed border-gray-200 rounded-3xl space-y-2">
            <Radio className="w-8 h-8 mx-auto text-gray-300 animate-pulse" />
            <p className="text-xs font-bold text-text-muted">No active devices paired</p>
            <p className="text-[10px] text-text-muted/70 max-w-[240px] mx-auto">
              Scan a device barcode or QR matrix to authorize live biosystem telemetry feeds.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {devices.map((device) => {
              const isOnline = device.status === 'online';
              return (
                <motion.div
                  key={device.id}
                  id={`device-card-${device.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-4 border border-white/80 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Device Icon Circle */}
                    <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Cpu className="w-5 h-5" />
                    </div>
                    
                    <div className="min-w-0">
                      <h5 className="text-xs font-black text-text-dark truncate">
                        {device.nickname}
                      </h5>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[9px] font-extrabold text-text-muted uppercase">
                          UID: {device.device_uid}
                        </span>
                        
                        {/* Status badge toggler! Clicking changes online/offline live to test postgres_changes! */}
                        <button
                          onClick={() => toggleDeviceStatus(device)}
                          title="Click to toggle status (Tests real-time update)"
                          className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-md text-[8px] font-black tracking-wider uppercase transition-colors"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                          <span className={isOnline ? 'text-emerald-700' : 'text-gray-500'}>
                            {device.status}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnpair(device.id, device.nickname)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition-colors cursor-pointer"
                    title="Unpair Device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* QR CAMERA VIEWFINDER MODAL */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-5">
            <div className="absolute inset-0" onClick={closeQrScanner} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 border border-gray-100 space-y-5"
            >
              {/* Close button */}
              <button
                onClick={closeQrScanner}
                className="absolute right-4 top-4 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-text-dark" />
              </button>

              <div className="space-y-1 pt-2">
                <h3 className="text-base font-black text-text-dark flex items-center gap-1.5">
                  <Camera className="w-5 h-5 text-primary" /> QR Code Scanner
                </h3>
                <p className="text-xs text-text-muted">
                  Align the Grow Smart pairing matrix on the gateway chassis.
                </p>
              </div>

              {/* Camera feed viewfinder viewport */}
              <div className="relative aspect-square w-full bg-black rounded-2xl overflow-hidden border-2 border-primary/20 flex flex-col items-center justify-center">
                
                {/* Visual Scanner HUD guide */}
                <div className="absolute inset-8 border-2 border-dashed border-emerald-400/50 rounded-xl pointer-events-none z-10">
                  {/* Laser light bar sweep animation */}
                  <div className="w-full h-0.5 bg-emerald-400 absolute top-0 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-[bounce_2s_infinite]" />
                </div>

                {cameraPermissionState === 'granted' ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="px-6 text-center text-gray-400 space-y-3 z-10">
                    <QrCode className="w-12 h-12 mx-auto text-gray-600 animate-pulse" />
                    {cameraPermissionState === 'prompt' && (
                      <p className="text-[11px] font-bold">Requesting hardware lens feed...</p>
                    )}
                    {cameraPermissionState === 'denied' && (
                      <p className="text-[10px] text-red-400 font-bold leading-normal">
                        Camera permission was restricted or blocked by the iframe sandboxing.
                      </p>
                    )}
                    {cameraPermissionState === 'unsupported' && (
                      <p className="text-[10px] text-amber-500 font-bold leading-normal">
                        Standard browser camera API is not supported on this device/connection.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Simulated scan control bar */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">
                    Pairing Simulation Shortcuts
                  </span>
                </div>
                
                <p className="text-[10px] text-text-muted leading-tight">
                  Click any hardware component below to simulate an instant high-fidelity QR scan:
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => selectMockQrCode('GS-SENSE-501', 'Zone 1 Temperature & Soil Hub')}
                    className="p-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span className="text-[10px] font-black text-primary block">GS-SENSE-501</span>
                    <span className="text-[9px] text-text-muted block mt-0.5 leading-tight truncate">Zone 1 Soil Core</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectMockQrCode('GS-LED-902', 'Zone 3 Multi-Spectrum LED Array')}
                    className="p-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span className="text-[10px] font-black text-primary block">GS-LED-902</span>
                    <span className="text-[9px] text-text-muted block mt-0.5 leading-tight truncate">Zone 3 Light Bar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectMockQrCode('GS-PUMP-404', 'Automated Fertigation Pump')}
                    className="p-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span className="text-[10px] font-black text-primary block">GS-PUMP-404</span>
                    <span className="text-[9px] text-text-muted block mt-0.5 leading-tight truncate">Fertigation Motor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectMockQrCode('GS-FLOW-102', 'Zone 4 Water Flow Valve')}
                    className="p-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span className="text-[10px] font-black text-primary block">GS-FLOW-102</span>
                    <span className="text-[9px] text-text-muted block mt-0.5 leading-tight truncate">Flow Meter</span>
                  </button>
                </div>
              </div>

              <button
                onClick={closeQrScanner}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-text-dark text-xs font-extrabold rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel Scan
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
