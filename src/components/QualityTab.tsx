import { useState } from 'react';
import { 
  CheckCircle, Download, Share2, Award, Droplet, 
  Sun, Sparkles, ShieldCheck, Check, Copy, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Certificate } from '../types';

interface QualityTabProps {
  initialCertificate: Certificate;
}

export default function QualityTab({ initialCertificate }: QualityTabProps) {
  const [selectedCrop, setSelectedCrop] = useState<'basil' | 'tomato' | 'lettuce'>('basil');
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Certificates for other crops as well so users can interact and switch crops!
  const certificates: Record<'basil' | 'tomato' | 'lettuce', Certificate> = {
    basil: initialCertificate,
    tomato: {
      cropType: 'Heirloom Roma Tomatoes',
      harvestDate: 'Nov 12, 2025',
      purityScore: 99.4,
      batchId: 'GS-ROMA-2025-X04',
      statement: '"Specimen yields demonstrated robust antioxidant accumulation and structural integrity, satisfying ultra-premium global distribution metrics."',
      signedBy: 'Alex Rivers',
      position: 'Lead Agronomist',
      growthDuration: 62,
      optimalWindowStatus: 'ACHIEVED',
      hydrationStability: 'Maintained 96% soil hydration equilibrium during fruit development.',
      photosyntheticLog: 'Integrated 450nm specific blue lights boosted lycopene levels by 15%.',
      terpeneProfile: 'Aromatic profiles confirm heavy sweet-savory notes indexing exceptional quality.'
    },
    lettuce: {
      cropType: 'Butterhead Lettuce',
      harvestDate: 'Jan 05, 2026',
      purityScore: 98.9,
      batchId: 'GS-BUTTER-2026-X11',
      statement: '"Outstanding crispness coefficient and microbial safety scores. Grown completely pesticide-free with full nutrient traceability."',
      signedBy: 'Alex Rivers',
      position: 'Lead Agronomist',
      growthDuration: 28,
      optimalWindowStatus: 'ACHIEVED',
      hydrationStability: 'Aero-root irrigation logged zero stress events over cycle.',
      photosyntheticLog: 'Red-dominant spectrum promoted dense, butter-soft foliage development.',
      terpeneProfile: 'Zero bitter compounds detected. Sugars are 8% higher than greenhouse average.'
    }
  };

  const activeCert = certificates[selectedCrop];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // Trigger dynamic file download mock
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(activeCert, null, 2)], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `GrowSmart_Certificate_${activeCert.batchId}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1800);
  };

  const handleShare = () => {
    setIsSharing(true);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setIsSharing(false);
    }, 2500);
  };

  // QR Code generator helper
  // Draw a grid representing a QR code with a custom icon in the middle
  const renderQrGrid = () => {
    const size = 11; // 11x11 grid
    const squares = [];
    
    // Seeded pattern to make it look like a real QR code
    const pattern = [
      1,1,1,1,1,1,1,0,1,1,1,
      1,0,0,0,0,0,1,0,0,0,1,
      1,0,1,1,1,0,1,1,1,0,1,
      1,0,1,1,1,0,1,0,1,0,1,
      1,0,1,1,1,0,1,0,0,0,1,
      1,0,0,0,0,0,1,1,1,1,1,
      1,1,1,1,1,1,1,0,1,0,0,
      0,0,1,0,0,0,0,1,0,1,1,
      1,1,0,1,1,1,0,0,1,0,1,
      1,0,0,0,1,0,1,1,0,0,1,
      1,1,1,1,1,1,1,1,1,1,1
    ];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const index = r * size + c;
        // Leave the center 3x3 empty for the icon
        const isCenter = r >= 4 && r <= 6 && c >= 4 && c <= 6;
        squares.push(
          <div 
            key={`${r}-${c}`}
            className={`w-3.5 h-3.5 rounded-[1px] transition-all duration-300 ${
              isCenter 
                ? 'bg-transparent' 
                : pattern[index] === 1 
                  ? 'bg-primary' 
                  : 'bg-white'
            }`}
          />
        );
      }
    }
    return squares;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header section */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-primary-light">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Quality Verification System
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-primary font-sans leading-tight">
          Certificate of Authenticity
        </h2>
        <p className="text-xs text-text-muted leading-normal">
          Advanced molecular analysis and environmental data synchronized to provide a complete harvest verification.
        </p>
      </div>

      {/* Switcher tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
        {(['basil', 'tomato', 'lettuce'] as const).map((crop) => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
              selectedCrop === crop 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-text-muted hover:text-text-dark hover:bg-white/30'
            }`}
          >
            {crop === 'basil' ? 'Basil' : crop === 'tomato' ? 'Tomatoes' : 'Lettuce'}
          </button>
        ))}
      </div>

      {/* Main Certificate Card Graphic */}
      <motion.section 
        layout="position"
        className="glass-card p-6 rounded-3xl relative overflow-hidden border border-primary/10 shadow-lg flex flex-col items-center text-center space-y-4"
      >
        {/* Holographic glowing emblem background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
        
        {/* Yellow Header Tag */}
        <div className="bg-accent-gold text-accent-gold-dark text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 fill-accent-gold-dark" /> AI-Verified Optimal Growth
        </div>

        <div className="w-full space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4 text-left border-b border-gray-100 pb-4">
            <div>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                CROP TYPE
              </span>
              <span className="text-base font-extrabold text-primary block truncate mt-0.5">
                {activeCert.cropType}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                HARVEST DATE
              </span>
              <span className="text-sm font-bold text-text-dark block mt-0.5">
                {activeCert.harvestDate}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left border-b border-gray-100 pb-4">
            <div>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                PURITY SCORE
              </span>
              <span className="text-3xl font-black font-mono text-primary block mt-0.5">
                {activeCert.purityScore}%
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                BATCH ID
              </span>
              <span className="text-xs font-mono font-bold text-text-dark bg-gray-50 border border-gray-100 px-2 py-1 rounded mt-1 inline-block truncate max-w-full">
                {activeCert.batchId}
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Quote */}
        <p className="text-xs text-text-muted italic leading-relaxed max-w-sm px-2 font-serif">
          {activeCert.statement}
        </p>

        {/* Signatures */}
        <div className="w-full grid grid-cols-2 gap-4 text-left border-t border-gray-100 pt-4 pb-2">
          <div>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">
              SIGNED BY
            </span>
            <span className="text-sm font-serif italic text-primary font-semibold block mt-0.5">
              {activeCert.signedBy}
            </span>
          </div>
          <div className="border-l border-gray-100 pl-4">
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">
              POSITION
            </span>
            <span className="text-xs font-semibold text-text-dark block mt-0.5">
              {activeCert.position}
            </span>
          </div>
        </div>

        {/* QR Code Grid Box */}
        <div className="relative p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center select-none">
          <div className="grid grid-cols-11 gap-[2px]">
            {renderQrGrid()}
          </div>
          
          {/* Central QR Tractor Icon Overlay */}
          <div className="absolute w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-50">
            <Award className="w-5 h-5 text-primary" />
          </div>
        </div>
        
        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
          SCAN TO TRACK ORIGIN & NUTRIENT DATA
        </span>

        {/* Growth Duration Progress Bar */}
        <div className="w-full text-left space-y-1 pt-2">
          <div className="flex justify-between text-[10px] font-bold uppercase text-text-muted">
            <span>GROWTH DURATION</span>
            <span className="text-primary font-black">{activeCert.growthDuration} DAYS</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(activeCert.growthDuration * 1.5, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-primary rounded-full" 
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-text-muted mt-1">
            <span>OPTIMAL WINDOW</span>
            <span className="text-primary font-extrabold tracking-wider">{activeCert.optimalWindowStatus}</span>
          </div>
        </div>
      </motion.section>

      {/* Dynamic Action Buttons */}
      <div className="space-y-3">
        <button 
          id="btn-export-certificate"
          onClick={handleExport}
          disabled={isExporting}
          className="w-full py-3 bg-primary hover:bg-primary-light text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
        >
          {isExporting ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Generating Security Hash...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Export Certificate
            </>
          )}
        </button>

        <button 
          id="btn-share-analytics"
          onClick={handleShare}
          className="w-full py-3 bg-white hover:bg-gray-50 text-primary border border-primary/20 font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-primary" /> Link Copied to Clipboard
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" /> Share Analytics
            </>
          )}
        </button>
      </div>

      {/* Copy notification */}
      <AnimatePresence>
        {copiedLink && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-4 right-4 bg-primary text-white py-2 px-4 rounded-xl text-xs font-bold text-center z-50 shadow-lg flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> Direct certificate link successfully copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quality Insight Cards */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-text-dark px-1">Verification Insights</h3>

        <div className="space-y-3">
          {/* Hydration Stability */}
          <div className="glass-card p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-text-dark">Hydration Stability</h4>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                98% OPTIMAL
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              {activeCert.hydrationStability}
            </p>
          </div>

          {/* Photosynthetic Log */}
          <div className="glass-card p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-text-dark">Photosynthetic Log</h4>
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase">
                100% MATCH
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              {activeCert.photosyntheticLog}
            </p>
          </div>

          {/* Terpene Profile */}
          <div className="glass-card p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-text-dark">Terpene Profile</h4>
              </div>
              <span className="text-[10px] font-bold text-primary bg-primary-container px-2 py-0.5 rounded-full uppercase">
                AI INSIGHT
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              {activeCert.terpeneProfile}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
