import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Link2, Copy, CheckCircle2, StopCircle, Users,
  Plus, X, Clock, Route, QrCode, History, UserPlus,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const SHARING_KEY = 'fc_location_sharing';
const HISTORY_KEY = 'fc_shared_history';

interface SharingState {
  active: boolean;
  shareCode: string;
  shareLiveLocation: boolean;
  shareEta: boolean;
  shareProgress: boolean;
}

interface SharedWithContact {
  id: string;
  name: string;
  addedAt: string;
}

interface SharedHistoryEntry {
  id: string;
  shareCode: string;
  from: string;
  to: string;
  date: string;
  active: boolean;
}

const defaultSharing: SharingState = {
  active: false,
  shareCode: '',
  shareLiveLocation: true,
  shareEta: true,
  shareProgress: true,
};

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FC-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function loadSharing(): SharingState {
  try {
    const raw = localStorage.getItem(SHARING_KEY);
    if (raw) return { ...defaultSharing, ...JSON.parse(raw) };
  } catch {}
  return defaultSharing;
}

function persistSharing(state: SharingState) {
  localStorage.setItem(SHARING_KEY, JSON.stringify(state));
}

function loadSharedWith(): SharedWithContact[] {
  try {
    const raw = localStorage.getItem(`${SHARING_KEY}_contacts`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: 'c1', name: 'Priya Sharma', addedAt: new Date().toISOString() },
    { id: 'c2', name: 'Rahul Verma', addedAt: new Date().toISOString() },
  ];
}

function persistSharedWith(contacts: SharedWithContact[]) {
  localStorage.setItem(`${SHARING_KEY}_contacts`, JSON.stringify(contacts));
}

function loadHistory(): SharedHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function persistHistory(entries: SharedHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

const LocationSharingScreen = () => {
  const [sharing, setSharing] = useState<SharingState>(loadSharing);
  const [sharedWith, setSharedWith] = useState<SharedWithContact[]>(loadSharedWith);
  const [history, setHistory] = useState<SharedHistoryEntry[]>(loadHistory);
  const [copied, setCopied] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  useEffect(() => {
    persistSharing(sharing);
  }, [sharing]);

  useEffect(() => {
    persistSharedWith(sharedWith);
  }, [sharedWith]);

  useEffect(() => {
    persistHistory(history);
  }, [history]);

  const handleGenerateLink = () => {
    const code = generateShareCode();
    setSharing(prev => ({ ...prev, active: true, shareCode: code }));
    const entry: SharedHistoryEntry = {
      id: `sh_${Date.now()}`,
      shareCode: code,
      from: 'Andheri Station',
      to: 'BKC, Mumbai',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      active: true,
    };
    setHistory(prev => [entry, ...prev].slice(0, 10));
  };

  const handleStopSharing = () => {
    setSharing(defaultSharing);
  };

  const handleCopy = () => {
    if (sharing.shareCode) {
      navigator.clipboard.writeText(sharing.shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddContact = () => {
    if (!newContactName.trim()) return;
    const contact: SharedWithContact = {
      id: `sc_${Date.now()}`,
      name: newContactName.trim(),
      addedAt: new Date().toISOString(),
    };
    setSharedWith(prev => [...prev, contact]);
    setNewContactName('');
    setAddContactOpen(false);
  };

  const handleRemoveContact = (id: string) => {
    setSharedWith(prev => prev.filter(c => c.id !== id));
  };

  const toggleSharingSetting = (key: 'shareLiveLocation' | 'shareEta' | 'shareProgress') => {
    setSharing(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Location Sharing</h1>
          <p className="text-gray-500 font-medium">Share your live journey with trusted contacts</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#f4f7eb] flex items-center justify-center">
                  <Share2 size={18} className="text-[#1b3a2a]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Share Live Journey</h3>
                  <p className="text-xs text-gray-500">Let others track your trip in real-time</p>
                </div>
              </div>

              {!sharing.active ? (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateLink}
                  className="w-full py-3.5 bg-[#1b3a2a] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#234d38] transition-all"
                >
                  <Link2 size={16} /> Generate Share Link
                </motion.button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#f0f7f2] border border-[#1b3a2a]/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Share Code</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600">Active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2.5">
                      <span className="text-sm font-mono font-bold text-gray-900 tracking-wider">{sharing.shareCode}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-xs font-semibold text-[#3c7689] hover:underline"
                      >
                        {copied ? <><CheckCircle2 size={12} className="text-emerald-500" /> Copied</> : <><Copy size={12} /> Copy</>}
                      </motion.button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                      <QrCode size={10} /> Share this code for live tracking
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Share2 size={14} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Share Live Location</span>
                      </div>
                      <Switch checked={sharing.shareLiveLocation} onCheckedChange={() => toggleSharingSetting('shareLiveLocation')} />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Share ETA</span>
                      </div>
                      <Switch checked={sharing.shareEta} onCheckedChange={() => toggleSharingSetting('shareEta')} />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Route size={14} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Share Journey Progress</span>
                      </div>
                      <Switch checked={sharing.shareProgress} onCheckedChange={() => toggleSharingSetting('shareProgress')} />
                    </label>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleStopSharing}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-red-200 hover:bg-red-100 transition-all"
                  >
                    <StopCircle size={16} /> Stop Sharing
                  </motion.button>
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-500" />
                  <h3 className="font-bold text-base text-gray-900">Shared With</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setAddContactOpen(true)}
                  className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <UserPlus size={14} className="text-gray-500" />
                </motion.button>
              </div>

              {sharedWith.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No contacts added yet</p>
              ) : (
                <div className="space-y-2">
                  {sharedWith.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1b3a2a]/10 flex items-center justify-center">
                          <Users size={13} className="text-[#1b3a2a]" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{contact.name}</span>
                      </div>
                      <button onClick={() => handleRemoveContact(contact.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <History size={16} className="text-gray-500" />
              <h3 className="font-bold text-base text-gray-900">Recent Shared Routes</h3>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-10">
                <Route size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No shared routes yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${entry.active ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                      <Share2 size={16} className={entry.active ? 'text-emerald-600' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">{entry.from} → {entry.to}</span>
                        {entry.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono font-bold text-gray-500">{entry.shareCode}</span>
                        <span className="text-[10px] text-gray-400">{entry.date}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${entry.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {entry.active ? 'Active' : 'Expired'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {addContactOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setAddContactOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } }}
              exit={{ opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.18 } }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[28px] p-7 w-full max-w-sm shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg text-gray-900">Add Contact</h2>
                <button onClick={() => setAddContactOpen(false)} className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X size={14} className="text-gray-500" />
                </button>
              </div>
              <input
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
                placeholder="Enter contact name"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#1b3a2a] focus:bg-white transition-all mb-5"
              />
              <div className="flex gap-3">
                <button onClick={() => setAddContactOpen(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleAddContact} disabled={!newContactName.trim()} className="flex-1 py-3 rounded-2xl bg-[#1b3a2a] text-sm font-bold text-white hover:bg-[#234d38] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Add</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LocationSharingScreen;
