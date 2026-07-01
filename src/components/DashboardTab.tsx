import React, { useState, useEffect } from 'react';
import { 
  Brain, X, TestTube, Zap, Thermometer, Droplets, Droplet, Wind,
  Plus, ChevronRight, Activity, Sprout, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Zone, Alert, Metric } from '../types';

interface DashboardTabProps {
  zones: Zone[];
  selectedZoneId: string;
  onSelectZone: (id: string) => void;
  alerts: Alert[];
  onDismissAlert: (id: string) => void;
  onAddZone: (newZone: Zone) => void;
  onTriggerAlert: () => void;
  onChangeTab?: (tab: 'dashboard' | 'tracking' | 'quality' | 'settings') => void;
}

export default function DashboardTab({
  zones,
  selectedZoneId,
  onSelectZone,
  alerts,
  onDismissAlert,
  onAddZone,
  onTriggerAlert,
  onChangeTab
}: DashboardTabProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCrop, setNewZoneCrop] = useState('Microgreens');
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);

  // Focus on active alert
  useEffect(() => {
    const active = alerts.find(a => a.active);
    if (active) {
      setActiveAlert(active);
    } else {
      setActiveAlert(null);
    }
  }, [alerts]);

  const activeZone = zones.find(z => z.id === selectedZoneId) || zones[0];

  // Helper to draw clean SVG sparkline path
  const generateSparklinePath = (data: number[], width: number, height: number, min: number, max: number) => {
    if (data.length < 2) return '';
    const stepX = width / (data.length - 1);
    const range = max - min === 0 ? 1 : max - min;
    
    return data.map((val, index) => {
      const x = index * stepX;
      // Invert Y so higher value is higher on the chart
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  // Helper to generate a nice wave fill path for sparkline gradient
  const generateSparklineAreaPath = (linePath: string, width: number, height: number) => {
    if (!linePath) return '';
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  };

  // Metrics logic based on currently selected zone - 6 cards matching mockup
  const getMetricsForZone = (zone: Zone): Metric[] => {
    const isAlertZone = zone.status === 'Warning' || zone.status === 'Critical';
    return [
      {
        id: 'ph',
        name: 'pH Levels',
        value: zone.pH.toFixed(1),
        unit: 'pH',
        icon: 'TestTube',
        history: zone.history.pH,
        status: isAlertZone && zone.pH > 6.5 ? 'alert' : 'normal'
      },
      {
        id: 'ec',
        name: 'EC Value',
        value: zone.ec.toFixed(1),
        unit: 'mS/cm',
        icon: 'Zap',
        history: zone.history.ec,
        status: 'normal'
      },
      {
        id: 'temp',
        name: 'Air Temp',
        value: zone.temp.toFixed(1),
        unit: '°C',
        icon: 'Thermometer',
        history: zone.history.temp,
        status: 'normal'
      },
      {
        id: 'humidity',
        name: 'Humidity',
        value: zone.humidity,
        unit: '% rH',
        icon: 'Droplets',
        history: zone.history.humidity,
        status: 'normal'
      },
      {
        id: 'tds',
        name: 'TDS (PPM)',
        value: Math.round(zone.ec * 500),
        unit: 'PPM',
        icon: 'Droplet',
        history: zone.history.ec.map(e => e * 500),
        status: 'normal'
      },
      {
        id: 'vpd',
        name: 'VPD (kPa)',
        value: zone.vpd.toFixed(2),
        unit: 'kPa',
        icon: 'Wind',
        history: [zone.vpd - 0.05, zone.vpd + 0.03, zone.vpd - 0.02, zone.vpd, zone.vpd],
        status: 'normal'
      }
    ];
  };

  const currentMetrics = activeZone ? getMetricsForZone(activeZone) : [];

  // Overall farm score calculator
  const calculateFarmScore = () => {
    if (zones.length === 0) return 100;
    const warningCount = zones.filter(z => z.status === 'Warning').length;
    const criticalCount = zones.filter(z => z.status === 'Critical').length;
    
    if (criticalCount > 0) return 78;
    if (warningCount > 0) return 91;
    return 94; // Exactly matches mockup optimal score
  };

  const farmScore = calculateFarmScore();

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    const id = `zone-${Date.now()}`;
    const newZone: Zone = {
      id,
      name: newZoneName,
      crop: newZoneCrop,
      status: 'Healthy',
      // Dynamic photos
      image: newZoneCrop === 'Lettuce' 
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_RbrE67FmLXhslP9sRqf8pmGxsTZ-_nJqaSlEAlnd9OUbRprKR3szN7_cKgrsWOo-0IK05FeRIiW6XoDTwlg7cJIaSEpAEahVhlf8LibeyD1znTHFrczHkEq3X4Ng2KVMSJgfNm_6lAZ5Rk84WZkQlHzdohnLm_zkgIKG8Yen2NNzTjuQlF7NwZpt51uaRupQMGFeOYNyxBQpl7ys1PHgBQc3BynFoydytJB5goZZbS0pIma19Ez-YTYgHdeFCjMymsp7ojov32J5'
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4lP5P_BYp68c1LpP3gnU6z3clwOR7dO2364KIGnOryeyGiYgp4LXr0DE0rOINOrhh67dP8-_o8vwCQCU81KpUIvZHyp9dwc6cuW1ef2ubRtjthhOXFlX-bHSLvPgqyGs7wEq6FTByuOv-kr8OqKLN_ZwGcbk5A7e9LvyRVbWp48EAhQzK8DBHHxwI2OWPmXSm9KhLyF-CedCF1U9eZa2OuDrmCISPH0L8CqHY5qXS566J36scXVFsxJRkNEG0DgHVkNVSauqsr5WV',
      pH: 6.3,
      ec: 1.7,
      temp: 24.2,
      humidity: 66,
      vpd: 0.90,
      growthStage: 'Vegetative',
      history: {
        pH: [6.2, 6.3, 6.3, 6.2, 6.4, 6.3, 6.3],
        ec: [1.6, 1.7, 1.7, 1.7, 1.8, 1.7, 1.7],
        temp: [23.5, 23.9, 24.1, 24.2, 24.5, 24.2, 24.2],
        humidity: [64, 65, 66, 67, 66, 66, 66]
      }
    };

    onAddZone(newZone);
    setNewZoneName('');
    setShowQuickActions(false);
  };

  if (zones.length === 0) {
    return (
      <div className="space-y-6 pb-24">
        <section className="glass-card p-8 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-primary/20 bg-white/50">
          <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-4">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-text-dark">No Active Cultivation Modules</h2>
          <p className="text-xs text-text-muted mt-2 max-w-sm leading-relaxed">
            Welcome to your precision biosphere portal! Your telemetry dashboard is currently clear. Initialize a custom hydroponic grow unit to start streaming live organic data.
          </p>
          
          <div className="w-full max-w-sm mt-8 border-t border-gray-100 pt-6">
            <form onSubmit={handleCreateZone} className="space-y-4 text-left">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                Establish New Module
              </h4>
              <div className="space-y-3">
                <input 
                  type="text"
                  required
                  placeholder="e.g. Zone 1 (Precision Basil)"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none text-text-dark"
                />
                
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Crop Variety</span>
                  <div className="flex gap-2">
                    {['Microgreens', 'Lettuce', 'Basil', 'Vine Crops'].map((crop) => (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => setNewZoneCrop(crop)}
                        className={`flex-1 py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                          newZoneCrop === crop 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-white text-text-muted border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {crop}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-primary hover:bg-primary-light text-white text-xs font-black uppercase tracking-wider rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Initialize Cultivation Unit
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      
      {/* AI Alert Banner */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-card ai-alert-glow border-secondary-container/30 bg-secondary-container/10 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-700"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-secondary-container flex items-center justify-center rounded-xl text-on-secondary-fixed">
              <Brain className="w-5 h-5 text-secondary" />
            </div>
            
            <div className="flex-1">
              <p className="font-label-caps text-label-caps text-secondary uppercase font-bold text-[10px] tracking-wider">
                AI Alert
              </p>
              <p className="font-body-sm text-body-sm text-on-surface font-semibold leading-tight text-text-dark mt-0.5">
                {activeAlert.message}
              </p>
              <button 
                onClick={() => {
                  const targetZone = zones.find(z => z.name === activeAlert.zone);
                  if (targetZone) onSelectZone(targetZone.id);
                }}
                className="text-[10px] font-black text-primary hover:underline mt-1 flex items-center gap-0.5"
              >
                Inspect Telemetry <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <button 
              id="btn-close-alert"
              onClick={() => onDismissAlert(activeAlert.id)}
              className="p-1 hover:bg-black/5 rounded-full text-text-muted hover:text-text-dark transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Farm Health Score Card */}
      <section className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative w-48 h-48">
          {/* Circular Progress Background */}
          <svg className="w-full h-full transform -rotate-90">
            <circle 
              className="text-surface-container-highest" 
              cx="96" 
              cy="96" 
              fill="transparent" 
              r="88" 
              stroke="currentColor" 
              strokeWidth="12"
            />
            <motion.circle 
              className="text-primary transition-all duration-1000 ease-out" 
              cx="96" 
              cy="96" 
              fill="transparent" 
              r="88" 
              stroke="currentColor" 
              strokeWidth="12"
              strokeDasharray="552.92"
              initial={{ strokeDashoffset: 552.92 }}
              animate={{ strokeDashoffset: 552.92 - (farmScore / 100) * 552.92 }}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Gauge Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display-lg text-display-lg text-primary text-4xl font-extrabold tracking-tight">
              {farmScore}%
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px] font-bold mt-0.5">
              {farmScore >= 90 ? 'Optimal' : 'Imbalanced'}
            </span>
          </div>
        </div>
        
        <div>
          <h2 className="font-title-md text-title-md text-on-surface text-lg font-extrabold tracking-tight">Farm Health Score</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-xs text-text-muted mt-1 max-w-xs">
            {farmScore >= 95 
              ? 'System performance is exceptional across all sectors.' 
              : 'System performance is exceptional. Remediating minor pH alert in lettuce unit.'}
          </p>
        </div>
      </section>

      {/* Active Zones Section */}
      <section className="space-y-3">
        <div className="flex justify-between items-end px-1">
          <h3 className="font-title-md text-title-md text-on-surface font-black text-base">Active Zones</h3>
          <span 
            onClick={() => onChangeTab && onChangeTab('tracking')}
            className="font-label-caps text-label-caps text-primary cursor-pointer hover:underline text-xs font-bold"
          >
            View All
          </span>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 px-1">
          {zones.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            const isWarning = zone.status === 'Warning' || zone.status === 'Critical';
            
            return (
              <div
                key={zone.id}
                id={`zone-card-${zone.id}`}
                onClick={() => onSelectZone(zone.id)}
                className={`glass-card min-w-[160px] p-4 flex flex-col gap-3 group active:scale-95 transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-white' 
                    : 'hover:border-primary/20 hover:bg-white/90'
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-highest shrink-0 border border-gray-100">
                  <img 
                    className="w-full h-full object-cover" 
                    src={zone.image} 
                    alt={zone.name} 
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div>
                  <p className="font-body-lg text-body-lg font-bold leading-tight text-text-dark">{zone.name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-xs text-text-muted">{zone.crop}</p>
                </div>

                <div className="space-y-1 mt-auto">
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] font-bold">
                    {zone.crop === 'Microgreens' || zone.crop === 'Kale' 
                      ? `Humidity: ${zone.humidity}%` 
                      : `pH: ${zone.pH.toFixed(1)}`}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${isWarning ? 'bg-error animate-pulse' : 'bg-primary'}`} />
                    <span className={`font-label-caps text-label-caps uppercase text-[9px] font-bold ${isWarning ? 'text-error' : 'text-primary'}`}>
                      {zone.status === 'Healthy' ? 'Optimal' : 'Warning'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Real-time Metrics Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-title-md text-title-md text-on-surface font-black text-base">
            Real-time Metrics: <span className="text-primary">{activeZone.name}</span>
          </h3>
          <span className="text-[10px] font-mono text-text-muted bg-gray-100 px-2 py-0.5 rounded">
            UPDATED SECONDS AGO
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentMetrics.map((metric) => {
            const isAlert = metric.status === 'alert';
            const minHistory = Math.min(...metric.history);
            const maxHistory = Math.max(...metric.history);
            const path = generateSparklinePath(metric.history, 100, 40, minHistory, maxHistory);
            const areaPath = generateSparklineAreaPath(path, 100, 40);

            return (
              <div 
                key={metric.id}
                className={`glass-card p-4 space-y-2 relative overflow-hidden transition-all duration-300 ${
                  isAlert ? 'border-error/30 bg-error-container/5' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px] font-bold text-text-muted">
                    {metric.name}
                  </span>
                  {metric.id === 'ph' && <TestTube className="w-4 h-4 text-secondary" />}
                  {metric.id === 'ec' && <Zap className="w-4 h-4 text-secondary" />}
                  {metric.id === 'temp' && <Thermometer className="w-4 h-4 text-secondary" />}
                  {metric.id === 'humidity' && <Droplets className="w-4 h-4 text-secondary" />}
                  {metric.id === 'tds' && <Droplet className="w-4 h-4 text-secondary" />}
                  {metric.id === 'vpd' && <Wind className="w-4 h-4 text-secondary" />}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-data-mono text-data-mono text-primary text-xl font-bold font-mono">
                    {metric.value}
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px] text-text-muted font-bold uppercase">
                    {metric.unit}
                  </span>
                </div>

                {/* Dynamic Responsive Sparkline */}
                <div className="h-10 w-full mt-2">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`gradient-${metric.id}`} x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#154212" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#154212" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Dynamic Area Fill */}
                    {areaPath && (
                      <path 
                        d={areaPath} 
                        fill={`url(#gradient-${metric.id})`} 
                        className="transition-all duration-500 ease-out"
                      />
                    )}
                    
                    {/* Dynamic Curve Line */}
                    {path && (
                      <path 
                        d={path} 
                        fill="transparent" 
                        stroke="#154212" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-500 ease-out"
                      />
                    )}

                    {/* Interactive warning/ph indicator dot from mockup */}
                    {metric.id === 'ph' && (
                      <circle cx="80" cy="10" fill="#fcd400" r="2.5" className="animate-pulse" />
                    )}
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating Action Button for Simulator Quick Actions */}
      <button 
        id="btn-fab-actions"
        onClick={() => setShowQuickActions(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_20px_rgba(21,66,18,0.3)] flex items-center justify-center active:scale-90 hover:bg-primary-light transition-all duration-200 z-40 cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Quick Actions Drawer / Overlay Modal */}
      <AnimatePresence>
        {showQuickActions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setShowQuickActions(false)}
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 pb-8 z-50"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-text-dark flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Core Simulator Actions
                </h3>
                <button 
                  onClick={() => setShowQuickActions(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Trigger simulated Alert */}
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-700" /> System Telemetry Simulator
                      </h4>
                      <p className="text-xs text-amber-800 mt-1">
                        Induce a mock pH nutrient drop in Zone 4 (Lettuce) to test the AI Warning indicator.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerAlert();
                        setShowQuickActions(false);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
                    >
                      Trigger pH Alert
                    </button>
                  </div>
                </div>

                {/* Add new Zone module */}
                <form onSubmit={handleCreateZone} className="p-4 bg-primary-container/20 border border-primary/10 rounded-2xl space-y-3">
                  <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <Sprout className="w-4 h-4" /> Expand Cultivation Unit
                  </h4>
                  <p className="text-xs text-text-muted">
                    Establish a new modular hydroponic grow zone with live telemetry.
                  </p>
                  
                  <div className="space-y-2">
                    <input 
                      type="text"
                      placeholder="e.g. Zone 5 (Sweet Basil)"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-xs font-medium focus:outline-none text-text-dark"
                    />
                    
                    <div className="flex gap-2">
                      {['Microgreens', 'Lettuce', 'Basil', 'Vine Crops'].map((crop) => (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => setNewZoneCrop(crop)}
                          className={`flex-1 py-1 px-1 text-[10px] font-bold rounded-lg border transition-all ${
                            newZoneCrop === crop 
                              ? 'bg-primary text-white border-primary' 
                              : 'bg-white text-text-muted border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {crop}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Initialize New Module
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
