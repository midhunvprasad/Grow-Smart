import React, { useState } from 'react';
import { 
  Plus, Search, ChevronRight, ArrowLeft, Save, Sparkles, Droplet, Scissors,
  FlaskConical, CheckCircle2, Loader2, Calendar, Wheat, Heart, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Zone, CropStage, JournalEntry } from '../types';

interface TrackingTabProps {
  zones: Zone[];
  onAddZone: (zone: Zone) => void;
  onUpdateZone: (zone: Zone) => void;
  journalEntries?: JournalEntry[];
  onAddJournalEntry?: (entry: JournalEntry) => void;
  onDeleteJournalEntry?: (id: string) => void;
}

const CROP_PRESETS = [
  {
    name: 'Sweet Genovese Basil',
    crop: 'Basil',
    growthStage: 'Seedling' as CropStage,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd_3TcNuyobE39AXepe4d8Y7Sx3F_EVXzhmdPMQccmQfJZizjFjrYPJ9BDG0I4-djovAeQONV745vAoCMNDcaIfFIm_tdoI6HvH8QR19XCUjHMrYifL_smaKYExmFipcwm-wSc_KF9RzBTuehSVnQdJMLro7E3hJXiGdlHRykL3XMWl4Ni3G1bGo0IUp6rjZ5nGPTEnSEunuRke-kAnCnEe2u4BfiW1swHcQSUOXFmVsW_ow3thol3sulE8FdnWW5PA59TPEqT_p2l',
    pH: 6.0,
    ec: 1.6,
    humidity: 70,
    temp: 22.0
  },
  {
    name: 'Heirloom Roma Tomatoes',
    crop: 'Tomatoes',
    growthStage: 'Vegetative' as CropStage,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAduFStSH35CBhN_w8_EMqOslEwCBitT1-Cxi0HkxOdIcK7SwsIXzrGyD2jLNiaNyQ5ptxvYegRvR_RuIxVOPr9pRIK8mSYvqwoMkYfODxXIi_sprlj4sBKFseUwb5fLz4hRxNIBgx27W5-4Fu-Fou8EZfCzsrfLcFfP8wwrlR1I9Uqkbl08iWFsBjI1yKaYN-iF5_u4o-kamQWHIERRnOTYeqdNNL0dL4O-oPBeOLBC87A9z1pWyV5RR3pmKCTHEs2pcK7pDlcivY2',
    pH: 6.2,
    ec: 2.1,
    humidity: 65,
    temp: 24.0
  },
  {
    name: 'Lacinato Kale',
    crop: 'Kale',
    growthStage: 'Flowering' as CropStage,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyQi3on32kJeFaLRcojZN8cymkFhqG5rYuCKjo2ZS4fdbDWXVRXtArghIsy6oq-guSd6V0Q3P1qn7VMsPV5WEa_mNQjOe15jKZip8dMZ-TtGhgvpgF8RDoUBxU6FLjw98Wa3-bBXKLOxRQyxjnVgSa8zxcylCuqiSKQeAfWgXNvavz8dGlcjR-ko9fOPipvjv07__j6x4FH0ED46L0_Va4C8MXzt-NbzUl19uTFVkHnKZ8e8tWJWcJQxqbkYE63pMtqVXmKOk_qMf9',
    pH: 6.5,
    ec: 1.8,
    humidity: 60,
    temp: 18.0
  },
  {
    name: 'Alpine Strawberries',
    crop: 'Strawberries',
    growthStage: 'Flowering' as CropStage,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEkVtLMnV4_u_RGN9BqxzFs_wDMhWIPhM94F33W5Sm7mNz2bTjgWWYd_uAACkN0CSJvvwiTpUpVvILGvmw46x4O6h_DeMshqa5fgm7-eiqkVTaAzvtErGgo088efJEcFG_yd4fsTgSUDs3Plyf7KZI5Cv_pdtDxTbabkUhmAOC3BgBIDInJmH3xBjGoBnHzaNHp90Lxt0omLP49dpu5we532aebOuFM7moegiA0CHejN8oGYIjqHSAUr1ob9pg-rAO9TXq_DYJOWLU',
    pH: 5.8,
    ec: 2.0,
    humidity: 65,
    temp: 21.0
  }
];

const getFallbackImage = (cropName: string): string => {
  const name = cropName.toLowerCase();
  if (name.includes('basil')) return CROP_PRESETS[0].image;
  if (name.includes('tomato')) return CROP_PRESETS[1].image;
  if (name.includes('kale')) return CROP_PRESETS[2].image;
  if (name.includes('strawberry') || name.includes('strawberries')) return CROP_PRESETS[3].image;
  return 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=300';
};

// Render custom responsive SVG sparklines based on sensor value arrays
function SensorSparkline({ values, color = '#154212' }: { values: number[]; color?: string }) {
  const width = 100;
  const height = 40;
  
  // Safe mock history if there is insufficient data
  const data = (values && values.length >= 2) 
    ? values 
    : [2.0, 2.3, 2.1, 2.4, 2.2, 2.5, 2.3];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 12) - 6;
    return { x, y };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const fillPathData = `${pathData} L ${width} ${height} L 0 ${height} Z`;
  const gradientId = `grad-${Math.random().toString(36).substr(2, 5)}`;

  return (
    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPathData} fill={`url(#${gradientId})`} />
      <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TrackingTab({
  zones,
  onAddZone,
  onUpdateZone,
  journalEntries = [],
  onAddJournalEntry
}: TrackingTabProps) {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states for adding crop
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [newCropType, setNewCropType] = useState('Basil');
  const [newGrowthStage, setNewGrowthStage] = useState<CropStage>('Seedling');
  const [newPh, setNewPh] = useState(6.0);
  const [newEc, setNewEc] = useState(1.8);
  const [newHumidity, setNewHumidity] = useState(65);
  const [newTemp, setNewTemp] = useState(22);

  // Detail/Update states
  const [detailPh, setDetailPh] = useState(6.0);
  const [detailEc, setDetailEc] = useState(1.8);
  const [detailHumidity, setDetailHumidity] = useState(65);
  const [detailTds, setDetailTds] = useState(900); // TDS mapped: EC * 500
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  // Filter zones matching search query
  const filteredZones = zones.filter(z => {
    const q = searchQuery.toLowerCase();
    return (
      z.name.toLowerCase().includes(q) ||
      z.crop.toLowerCase().includes(q) ||
      z.growthStage.toLowerCase().includes(q)
    );
  });

  // Open detail tracking page
  const handleSelectCrop = (zone: Zone) => {
    setSelectedZone(zone);
    setDetailPh(zone.pH);
    setDetailEc(zone.ec);
    setDetailHumidity(zone.humidity);
    setDetailTds(Math.round(zone.ec * 500));
    setView('detail');
  };

  // Safe back to list view
  const handleBackToList = () => {
    setView('list');
    setSelectedZone(null);
    setSaveSuccess(false);
    setIsSaving(false);
  };

  // Dual binding for EC and TDS sliders
  const handleEcChange = (val: number) => {
    setDetailEc(val);
    setDetailTds(Math.round(val * 500));
  };

  const handleTdsChange = (val: number) => {
    setDetailTds(val);
    // Maintain decimal precision for EC
    setDetailEc(Number((val / 500).toFixed(2)));
  };

  // Create crop entry
  const handleAddCropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName.trim()) return;

    const presetImg = getFallbackImage(newCropType);
    
    // Construct Zone type
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: newCropName,
      crop: newCropType,
      status: 'Healthy',
      image: presetImg,
      pH: Number(newPh),
      ec: Number(newEc),
      temp: Number(newTemp),
      humidity: Number(newHumidity),
      vpd: 1.1, // standard default
      growthStage: newGrowthStage,
      history: {
        pH: [newPh - 0.2, newPh + 0.1, newPh - 0.1, newPh, newPh],
        ec: [newEc - 0.1, newEc + 0.2, newEc - 0.2, newEc, newEc],
        temp: [newTemp - 1, newTemp + 1, newTemp, newTemp, newTemp],
        humidity: [newHumidity - 5, newHumidity + 3, newHumidity - 2, newHumidity, newHumidity]
      }
    };

    onAddZone(newZone);

    // Reset fields
    setNewCropName('');
    setNewCropType('Basil');
    setNewGrowthStage('Seedling');
    setShowAddModal(false);
  };

  // Trigger quick log updates (Reservoir Flush, Pruning, Nutrient Feed)
  const handleQuickLog = (eventLabel: string) => {
    if (!selectedZone) return;
    
    setActiveEvent(eventLabel);
    
    // Add dynamic notification log to list
    if (onAddJournalEntry) {
      const newEntry: JournalEntry = {
        id: `journal-${Date.now()}`,
        week: 4,
        dateRange: 'Today',
        avgPh: detailPh,
        avgEc: detailEc,
        vpd: selectedZone.vpd,
        growthStage: selectedZone.growthStage,
        notes: `Quick Log Event triggered: ${eventLabel} performed on module.`,
        insight: `Calibrated Biosphere parameters following: ${eventLabel}.`,
        createdAt: new Date().toISOString()
      };
      onAddJournalEntry(newEntry);
    }

    setTimeout(() => {
      setActiveEvent(null);
    }, 1200);
  };

  // Commit updated crop details
  const handleSaveTelemetry = () => {
    if (!selectedZone) return;

    setIsSaving(true);
    
    setTimeout(() => {
      // Build updated zone object with expanded history
      const updated: Zone = {
        ...selectedZone,
        pH: Number(detailPh),
        ec: Number(detailEc),
        humidity: Number(detailHumidity),
        // push new values to history arrays
        history: {
          pH: [...selectedZone.history.pH.slice(-6), Number(detailPh)],
          ec: [...selectedZone.history.ec.slice(-6), Number(detailEc)],
          temp: [...selectedZone.history.temp.slice(-6), selectedZone.temp],
          humidity: [...selectedZone.history.humidity.slice(-6), Number(detailHumidity)]
        }
      };

      onUpdateZone(updated);
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Auto return back to list shortly after success
      setTimeout(() => {
        setView('list');
        setSelectedZone(null);
        setSaveSuccess(false);
      }, 1500);

    }, 1200);
  };

  return (
    <div className="space-y-6 pb-24">
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: ACTIVE CROPS LIST */}
        {view === 'list' && (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Header section with add button */}
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-primary tracking-tight">Active Crops</h2>
                <p className="text-xs text-text-muted font-bold">
                  {zones.length} {zones.length === 1 ? 'crop' : 'crops'} currently in rotation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Crop
              </button>
            </div>

            {/* Search Input bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cultivars, stages, or health..."
                className="w-full bg-surface-container-low border-none rounded-xl pl-11 pr-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-text-muted text-text-dark"
              />
            </div>

            {/* Crops Bento List */}
            {filteredZones.length === 0 ? (
              <div className="glass-card p-8 rounded-3xl text-center space-y-4 border border-dashed border-primary/20">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto text-primary">
                  <Wheat className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-text-dark">No Crops Found</h3>
                  <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                    {searchQuery ? 'No cultivation modules match your search filters.' : 'Your active biosphere is clear. Populate your modules with fresh cultivars to start streaming sensor logs.'}
                  </p>
                </div>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="py-2.5 px-5 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow cursor-pointer active:scale-95"
                  >
                    Add Your First Crop
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredZones.map((zone) => {
                  
                  // Setup custom indicator color matching stage
                  const isSeedling = zone.growthStage === 'Seedling';
                  const isVeg = zone.growthStage === 'Vegetative';
                  const isFlowering = zone.growthStage === 'Flowering';
                  
                  const statusDotColor = isSeedling 
                    ? 'bg-amber-400 shadow-[0_0_8px_#ffe16d]' 
                    : isVeg 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                      : isFlowering 
                        ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' 
                        : 'bg-primary shadow-[0_0_8px_rgba(21,66,18,0.5)]';

                  // Determine status description text
                  let statusDesc = 'Optimal Health';
                  if (zone.status === 'Warning') statusDesc = 'Needs Attention';
                  if (zone.status === 'Critical') statusDesc = 'Critical Warning';
                  if (zone.crop === 'Basil' && isSeedling) statusDesc = 'Optimal Health';
                  if (zone.crop === 'Tomatoes' && isVeg) statusDesc = 'Needs Water';
                  if (zone.crop === 'Kale' && isFlowering) statusDesc = 'Harvest Soon';
                  if (zone.status === 'Warning' || zone.pH < 5.5) statusDesc = 'Alert: Low pH';

                  return (
                    <div
                      key={zone.id}
                      onClick={() => handleSelectCrop(zone)}
                      className="glass-card p-4 rounded-3xl flex gap-4 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all border border-transparent group bg-white/70 backdrop-blur-md"
                    >
                      {/* Image container */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                        <img 
                          src={zone.image} 
                          alt={zone.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Info & Badges */}
                      <div className="flex flex-col justify-between flex-grow py-0.5">
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-text-dark leading-tight group-hover:text-primary transition-colors">
                            {zone.name}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${statusDotColor}`} />
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                              {zone.growthStage}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            zone.status === 'Critical' 
                              ? 'bg-red-100 text-red-800' 
                              : zone.status === 'Warning' 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-primary-fixed/30 text-primary'
                          }`}>
                            {statusDesc}
                          </span>
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 2: UPDATE CROP DATA */}
        {view === 'detail' && selectedZone && (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Custom Header with Back Button */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleBackToList}
                className="p-1 rounded-lg hover:bg-gray-100 text-primary cursor-pointer transition-colors active:scale-90"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-black text-primary tracking-tight">Update Crop Data</h2>
            </div>

            {/* Crop identity banner */}
            <section className="flex items-center gap-4 py-2 border-b border-gray-100">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                <img 
                  src={selectedZone.image} 
                  alt={selectedZone.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-text-dark">{selectedZone.name}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_8px_#ffe16d] animate-pulse" />
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-wider">
                    Active Growth Phase • {selectedZone.growthStage}
                  </p>
                </div>
              </div>
            </section>

            {/* Sliders Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Metric 1: pH Level */}
              <div className="glass-card p-5 rounded-2xl flex flex-col gap-3 bg-white/70">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">PH LEVEL</span>
                    <span className="text-xl font-black text-primary font-mono">{detailPh.toFixed(1)}</span>
                  </div>
                  <div className="w-24 h-10 shrink-0">
                    <SensorSparkline values={selectedZone.history.pH} color="#154212" />
                  </div>
                </div>
                <input 
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={detailPh}
                  disabled={isSaving}
                  onChange={(e) => setDetailPh(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-secondary cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* Metric 2: EC (Electrical Conductivity) */}
              <div className="glass-card p-5 rounded-2xl flex flex-col gap-3 bg-white/70">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">EC (mS/cm)</span>
                    <span className="text-xl font-black text-primary font-mono">{detailEc.toFixed(1)}</span>
                  </div>
                  <div className="w-24 h-10 shrink-0">
                    <SensorSparkline values={selectedZone.history.ec} color="#154212" />
                  </div>
                </div>
                <input 
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={detailEc}
                  disabled={isSaving}
                  onChange={(e) => handleEcChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-secondary cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* Metric 3: Humidity (%) */}
              <div className="glass-card p-5 rounded-2xl flex flex-col gap-3 bg-white/70">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">HUMIDITY (%)</span>
                    <span className="text-xl font-black text-primary font-mono">{Math.round(detailHumidity)}%</span>
                  </div>
                  <div className="w-24 h-10 shrink-0">
                    <SensorSparkline values={selectedZone.history.humidity} color="#154212" />
                  </div>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={detailHumidity}
                  disabled={isSaving}
                  onChange={(e) => setDetailHumidity(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-secondary cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* Metric 4: TDS (ppm) (Editable Input) */}
              <div className="glass-card p-5 rounded-2xl flex flex-col gap-3 bg-white/70 justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">TDS (PPM)</span>
                    <span className="text-xl font-black text-primary font-mono">{detailTds} ppm</span>
                  </div>
                  <div className="w-24 h-10 shrink-0">
                    <SensorSparkline values={selectedZone.history.ec.map(e => e * 500)} color="#154212" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    min="0"
                    max="2500"
                    value={detailTds}
                    disabled={isSaving}
                    onChange={(e) => handleTdsChange(Number(e.target.value))}
                    className="bg-gray-50 border border-gray-100 rounded-xl font-mono text-primary w-full h-10 text-center text-xs font-bold focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>
              </div>

            </section>

            {/* Quick Log Events */}
            <section className="space-y-3">
              <h4 className="text-[10px] font-black text-text-muted uppercase tracking-wider px-1">
                QUICK LOG EVENTS
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => handleQuickLog('Reservoir Flush')}
                  disabled={isSaving || activeEvent !== null}
                  className="flex-shrink-0 bg-white/70 border border-gray-100 px-4 py-3 rounded-2xl flex items-center gap-2 active:scale-95 transition-all text-xs font-bold text-text-dark cursor-pointer shadow-sm hover:border-primary/10"
                >
                  <Droplet className="w-4 h-4 text-primary shrink-0" />
                  <span>{activeEvent === 'Reservoir Flush' ? 'Logged!' : 'Reservoir Flush'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLog('Pruning')}
                  disabled={isSaving || activeEvent !== null}
                  className="flex-shrink-0 bg-white/70 border border-gray-100 px-4 py-3 rounded-2xl flex items-center gap-2 active:scale-95 transition-all text-xs font-bold text-text-dark cursor-pointer shadow-sm hover:border-primary/10"
                >
                  <Scissors className="w-4 h-4 text-primary shrink-0" />
                  <span>{activeEvent === 'Pruning' ? 'Logged!' : 'Pruning'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLog('Nutrient Feed')}
                  disabled={isSaving || activeEvent !== null}
                  className="flex-shrink-0 bg-white/70 border border-gray-100 px-4 py-3 rounded-2xl flex items-center gap-2 active:scale-95 transition-all text-xs font-bold text-text-dark cursor-pointer shadow-sm hover:border-primary/10"
                >
                  <FlaskConical className="w-4 h-4 text-primary shrink-0" />
                  <span>{activeEvent === 'Nutrient Feed' ? 'Logged!' : 'Nutrient Feed'}</span>
                </button>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={handleSaveTelemetry}
                disabled={isSaving || saveSuccess}
                className={`w-full h-12 rounded-full font-bold flex items-center justify-center gap-2 shadow transition-all cursor-pointer ${
                  saveSuccess 
                    ? 'bg-secondary text-on-secondary' 
                    : 'bg-primary text-white hover:bg-primary-light active:scale-95'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Telemetry...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Telemetry Logged Successfully</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Telemetry Update</span>
                  </>
                )}
              </button>
              
              <p className="text-center text-[10px] text-text-muted italic">
                Last broadcast: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* MODAL: ADD NEW CROP */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 border border-gray-100"
            >
              <h3 className="text-sm font-black text-text-dark mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Initialize Custom Crop
              </h3>

              <form onSubmit={handleAddCropSubmit} className="space-y-4">
                {/* Crop Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                    Crop Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red Heirloom Roma"
                    value={newCropName}
                    onChange={(e) => setNewCropName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary text-text-dark"
                  />
                </div>

                {/* Cultivar Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                    Cultivar Category
                  </label>
                  <select
                    value={newCropType}
                    onChange={(e) => setNewCropType(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary text-text-dark"
                  >
                    <option value="Basil">Basil (Sweet Genovese)</option>
                    <option value="Tomatoes">Tomatoes (Roma Heirloom)</option>
                    <option value="Kale">Kale (Curly Lacinato)</option>
                    <option value="Strawberries">Strawberries (Alpine Berry)</option>
                    <option value="Lettuce">Lettuce (Butterhead)</option>
                    <option value="Mint">Peppermint (Herbal)</option>
                  </select>
                </div>

                {/* Growth Stage selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                    Initial growth stage
                  </label>
                  <select
                    value={newGrowthStage}
                    onChange={(e) => setNewGrowthStage(e.target.value as CropStage)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary text-text-dark"
                  >
                    <option value="Seedling">Seedling</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Harvest">Harvest Ready</option>
                  </select>
                </div>

                {/* Sensors slider initializers */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block">
                      Target pH
                    </label>
                    <input 
                      type="number"
                      step="0.1"
                      min="5.0"
                      max="7.5"
                      value={newPh}
                      onChange={(e) => setNewPh(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1.5 text-xs font-bold text-center font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block">
                      Target EC
                    </label>
                    <input 
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="3.5"
                      value={newEc}
                      onChange={(e) => setNewEc(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1.5 text-xs font-bold text-center font-mono"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 py-2.5 border border-gray-100 hover:bg-gray-50 text-text-muted text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-primary hover:bg-primary-light text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow transition-colors cursor-pointer text-center"
                  >
                    Establish Crop
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
