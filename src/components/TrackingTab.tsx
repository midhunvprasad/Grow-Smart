import React, { useState } from 'react';
import { 
  Sprout, Leaf, Flower2, Tractor, Plus, ChevronDown, 
  ChevronUp, Calendar, AlertCircle, Check, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, CropStage } from '../types';

interface TrackingTabProps {
  journalEntries: JournalEntry[];
  onAddJournalEntry: (entry: JournalEntry) => void;
  onDeleteJournalEntry: (id: string) => void;
}

export default function TrackingTab({
  journalEntries,
  onAddJournalEntry,
  onDeleteJournalEntry
}: TrackingTabProps) {
  const [activeStage, setActiveStage] = useState<CropStage>('Vegetative');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>('journal-4');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new entry
  const [formWeek, setFormWeek] = useState(5);
  const [formDates, setFormDates] = useState('May 21 - May 27');
  const [formPh, setFormPh] = useState(6.2);
  const [formEc, setFormEc] = useState(1.8);
  const [formVpd, setFormVpd] = useState(0.95);
  const [formNotes, setFormNotes] = useState('');
  const [formStage, setFormStage] = useState<CropStage>('Vegetative');

  const stages: { id: CropStage; label: string; icon: any }[] = [
    { id: 'Seedling', label: 'Seedling', icon: Sprout },
    { id: 'Vegetative', label: 'Vegetative', icon: Leaf },
    { id: 'Flowering', label: 'Flowering', icon: Flower2 },
    { id: 'Harvest', label: 'Harvest', icon: Tractor },
  ];

  const handleToggleExpand = (id: string) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNotes.trim()) return;

    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      week: Number(formWeek),
      dateRange: formDates,
      avgPh: Number(formPh),
      avgEc: Number(formEc),
      vpd: Number(formVpd),
      growthStage: formStage,
      insight: formNotes,
      notes: formNotes,
      createdAt: new Date().toISOString()
    };

    onAddJournalEntry(newEntry);
    setExpandedEntryId(newEntry.id);
    
    // Reset form
    setFormWeek(formWeek + 1);
    setFormNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Crop Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-primary font-sans leading-tight">
          Tracking: Heirloom Roma
        </h2>
        <p className="text-xs text-text-muted font-medium">
          Plot 12-B • Batch #88421
        </p>
      </div>

      {/* Interactive Growth Stage Card */}
      <section className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Growth Stage
          </span>
          <span className="px-3 py-1 bg-accent-gold text-accent-gold-dark text-[10px] font-black rounded-full uppercase tracking-wider">
            {activeStage}
          </span>
        </div>

        {/* Growth line timeline */}
        <div className="relative pt-4 pb-2">
          {/* Connecting grey background line */}
          <div className="absolute top-[38px] left-[10%] right-[10%] h-1 bg-gray-200 -z-10" />
          
          {/* Green active progress line */}
          <div 
            className="absolute top-[38px] left-[10%] h-1 bg-primary -z-10 transition-all duration-500 ease-out"
            style={{
              width: 
                activeStage === 'Seedling' ? '0%' :
                activeStage === 'Vegetative' ? '33%' :
                activeStage === 'Flowering' ? '66%' : '80%'
            }}
          />

          <div className="grid grid-cols-4 text-center">
            {stages.map((stage) => {
              const StageIcon = stage.icon;
              const isSelected = activeStage === stage.id;
              
              // Determine if stage is completed or current
              const stageIndex = stages.findIndex(s => s.id === stage.id);
              const activeIndex = stages.findIndex(s => s.id === activeStage);
              const isCompleted = stageIndex < activeIndex;

              return (
                <button
                  key={stage.id}
                  id={`stage-node-${stage.id}`}
                  onClick={() => setActiveStage(stage.id)}
                  className="flex flex-col items-center gap-2 focus:outline-none"
                >
                  <div 
                    className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-primary border-primary text-white scale-110 shadow-md ring-4 ring-primary/10' 
                        : isCompleted 
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-gray-200 text-text-muted hover:border-primary/20'
                    }`}
                  >
                    {isCompleted && !isSelected ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <StageIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold tracking-tight uppercase ${
                    isSelected ? 'text-primary font-black' : 'text-text-muted'
                  }`}>
                    {stage.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Weekly Journal Log Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold text-text-dark">Weekly Journal</h3>
          <button
            id="btn-new-entry"
            onClick={() => setShowAddModal(true)}
            className="text-[11px] font-extrabold text-primary hover:text-primary-light flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full border border-primary/10 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> NEW ENTRY
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {journalEntries.map((entry) => {
              const isExpanded = expandedEntryId === entry.id;

              return (
                <motion.div
                  key={entry.id}
                  layout="position"
                  className="glass-card rounded-2xl overflow-hidden transition-all border border-gray-100"
                >
                  {/* Card Header Header click triggers expand/collapse */}
                  <button
                    onClick={() => handleToggleExpand(entry.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="border-l-4 border-primary pl-3 py-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block">
                          CURRENT
                        </span>
                        <h4 className="text-sm font-bold text-text-dark leading-tight">
                          Week {entry.week}
                        </h4>
                      </div>
                      <span className="text-xs text-text-muted flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <Calendar className="w-3 h-3 text-primary-light" /> {entry.dateRange}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.id.startsWith('journal-') && !['journal-4', 'journal-3', 'journal-2'].includes(entry.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteJournalEntry(entry.id);
                          }}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-muted" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Body Content */}
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 pt-0 border-t border-gray-50 space-y-4"
                    >
                      {/* Metric Summary Averages */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
                          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                            AVG pH
                          </p>
                          <p className="text-base font-black font-mono text-primary mt-0.5">
                            {entry.avgPh.toFixed(1)}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
                          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                            AVG EC
                          </p>
                          <p className="text-base font-black font-mono text-primary mt-0.5">
                            {entry.avgEc.toFixed(1)} <span className="text-[9px] font-sans font-medium text-text-muted">mS/cm</span>
                          </p>
                        </div>

                        <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
                          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                            VPD
                          </p>
                          <p className="text-base font-black font-mono text-primary mt-0.5">
                            {entry.vpd.toFixed(2)} <span className="text-[9px] font-sans font-medium text-text-muted">kPa</span>
                          </p>
                        </div>
                      </div>

                      {/* AI Insight banner inside card */}
                      <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl flex gap-3">
                        <span className="w-8 h-8 rounded-full bg-accent-gold flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-4 h-4 text-accent-gold-dark" />
                        </span>
                        <div>
                          <span className="text-[9px] font-bold text-accent-gold-dark uppercase tracking-widest block mb-0.5">
                            AI INSIGHT
                          </span>
                          <p className="text-xs text-text-dark font-medium leading-relaxed">
                            {entry.insight}
                          </p>
                        </div>
                      </div>

                      {/* Yield Matching blocks / Grey progress blocks at the bottom */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-text-muted uppercase tracking-wider">
                            <span>Biomass density</span>
                            <span className="text-primary">84%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '84%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-text-muted uppercase tracking-wider">
                            <span>Target Consistency</span>
                            <span className="text-primary">92%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '92%' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* Add Weekly Journal Entry Drawer */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 pb-8 z-10"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

              <h3 className="text-lg font-bold text-text-dark mb-4">
                Record Weekly Journal Log
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      Week Number
                    </label>
                    <input 
                      type="number"
                      required
                      value={formWeek}
                      onChange={(e) => setFormWeek(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      Growth Phase
                    </label>
                    <select
                      value={formStage}
                      onChange={(e) => setFormStage(e.target.value as CropStage)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                    >
                      <option value="Seedling">Seedling</option>
                      <option value="Vegetative">Vegetative</option>
                      <option value="Flowering">Flowering</option>
                      <option value="Harvest">Harvest</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Date Interval
                  </label>
                  <input 
                    type="text"
                    required
                    value={formDates}
                    onChange={(e) => setFormDates(e.target.value)}
                    placeholder="e.g. May 21 - May 27"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      pH Value
                    </label>
                    <input 
                      type="number"
                      step="0.1"
                      required
                      value={formPh}
                      onChange={(e) => setFormPh(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      EC (mS/cm)
                    </label>
                    <input 
                      type="number"
                      step="0.1"
                      required
                      value={formEc}
                      onChange={(e) => setFormEc(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      VPD (kPa)
                    </label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={formVpd}
                      onChange={(e) => setFormVpd(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Observations & AI Insights
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide specific notes regarding leaf expansion, nutrient updates, etc."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-text-dark text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary hover:bg-primary-light text-white text-xs font-extrabold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Save Log Entry
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
