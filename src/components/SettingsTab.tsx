import React, { useState } from 'react';
import { 
  Settings, User, Radio, Lightbulb, BellRing, Gauge, 
  Trash2, ShieldAlert, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsTabProps {
  onResetData: () => void;
  userEmail: string;
}

export default function SettingsTab({ onResetData, userEmail }: SettingsTabProps) {
  const [gatewayEnabled, setGatewayEnabled] = useState(true);
  const [ledSpectrum, setLedSpectrum] = useState('full-spectrum');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [lowPhThreshold, setLowPhThreshold] = useState(5.5);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetClick = () => {
    setIsResetting(true);
    setTimeout(() => {
      onResetData();
      setIsResetting(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-primary font-sans leading-tight flex items-center gap-2">
          <Settings className="w-6 h-6" /> System Settings
        </h2>
        <p className="text-xs text-text-muted">
          Configure hardware parameters, notification rules, and agricultural calibrations.
        </p>
      </div>

      {/* User Card */}
      <section className="glass-card p-5 rounded-2xl flex items-center gap-4 border border-primary/10">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
          AR
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-dark">Alex Rivers</h3>
          <p className="text-[11px] text-primary font-bold">Lead Agronomist</p>
          <p className="text-xs text-text-muted mt-0.5">{userEmail || 'midhunvprasad@gmail.com'}</p>
        </div>
      </section>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Hardware Integrations */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-primary" /> Hardware & Gateways
          </h4>

          {/* IoT Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-text-dark block">IoT Telemetry Gateway</span>
              <span className="text-[10px] text-text-muted leading-tight block">
                Continuous transmission of modular sensor arrays via wireless link.
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

          {/* LED Schedule */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold text-text-dark flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-primary" /> Spectrum Calibration
            </label>
            <select
              value={ledSpectrum}
              onChange={(e) => setLedSpectrum(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
            >
              <option value="full-spectrum">Full Spectrum (Optimized Biomass)</option>
              <option value="veg-dominant">Veg-Dominant Blue (Leaf Growth)</option>
              <option value="flowering-red">Flowering-Dominant Red (Fruit Yield)</option>
              <option value="germination">Warm White (Germination & Seedlings)</option>
            </select>
          </div>
        </div>

        {/* Alarm Thresholds */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-primary" /> Alarm Trigger Thresholds
          </h4>

          {/* pH trigger */}
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
            <p className="text-[10px] text-text-muted leading-relaxed">
              Triggers an instant AI warning banner and high-priority push event if pH falls below threshold.
            </p>
          </div>

          {/* Temperature Units Selector */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-text-dark">Telemetry Unit System</span>
            <div className="bg-gray-100 p-0.5 rounded-lg flex gap-1">
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  tempUnit === 'C' ? 'bg-white text-primary shadow-sm' : 'text-text-muted'
                }`}
              >
                °C (Metric)
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  tempUnit === 'F' ? 'bg-white text-primary shadow-sm' : 'text-text-muted'
                }`}
              >
                °F (Imperial)
              </button>
            </div>
          </div>
        </div>

        {/* Notifications config */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <BellRing className="w-4 h-4 text-primary" /> Dispatch Channels
          </h4>

          <label className="flex items-start gap-2.5 py-1.5 cursor-pointer">
            <input 
              type="checkbox"
              checked={notifySms}
              onChange={(e) => setNotifySms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="-mt-0.5">
              <span className="text-xs font-bold text-text-dark block">SMS Alerts</span>
              <span className="text-[10px] text-text-muted block">Immediate delivery of critical system shutdowns.</span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 py-1.5 border-t border-gray-100 cursor-pointer">
            <input 
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="-mt-0.5">
              <span className="text-xs font-bold text-text-dark block">Email Analytics digest</span>
              <span className="text-[10px] text-text-muted block">Weekly telemetry summaries and certificate updates.</span>
            </div>
          </label>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full py-3 bg-primary hover:bg-primary-light text-white font-extrabold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Parameters Updated Successfully
            </>
          ) : 'Save System Settings'}
        </button>
      </form>

      {/* Dangerous/Diagnostic Section */}
      <section className="glass-card p-5 border-red-200 bg-red-50/20 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" /> System Recovery
        </h4>
        <p className="text-xs text-red-900 leading-relaxed">
          Erase all customized journal logs, simulation metrics, and custom modules. Returns the database back to standard factory settings.
        </p>

        <button
          id="btn-factory-reset"
          onClick={handleResetClick}
          disabled={isResetting}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {isResetting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Purging cache databases...
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" /> Erase and Reset to Defaults
            </>
          )}
        </button>
      </section>
    </div>
  );
}
