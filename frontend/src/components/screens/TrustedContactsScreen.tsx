import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Phone, Mail, Users, Heart, Bell,
  Trash2, ChevronRight, User,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { TrustedContact } from '@/lib/types';
import { Switch } from '@/components/ui/switch';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const mockContacts: TrustedContact[] = [
  { id: 'c1', userId: 'user_1', name: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya@example.com', relationship: 'Sister', notifyOnStart: true, notifyOnArrival: true, shareLiveLocation: true, createdAt: new Date().toISOString() },
  { id: 'c2', userId: 'user_1', name: 'Rahul Verma', phone: '+91 87654 32109', email: 'rahul@example.com', relationship: 'Friend', notifyOnStart: false, notifyOnArrival: true, shareLiveLocation: false, createdAt: new Date().toISOString() },
  { id: 'c3', userId: 'user_1', name: 'Anita Desai', phone: '+91 76543 21098', relationship: 'Mother', notifyOnStart: true, notifyOnArrival: true, shareLiveLocation: true, createdAt: new Date().toISOString() },
];

const CONTACTS_KEY = 'fc_trusted_contacts';

function loadContacts(userId: string): TrustedContact[] {
  try {
    const raw = localStorage.getItem(`${CONTACTS_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return mockContacts;
}

function saveContacts(userId: string, contacts: TrustedContact[]) {
  localStorage.setItem(`${CONTACTS_KEY}_${userId}`, JSON.stringify(contacts));
}

interface ContactForm {
  name: string; phone: string; email: string; relationship: string;
}

const emptyForm: ContactForm = { name: '', phone: '', email: '', relationship: '' };

const TrustedContactsScreen = () => {
  const { user } = useAuth();
  const userId = user?.username || 'user_1';

  const [contacts, setContacts] = useState<TrustedContact[]>(() => loadContacts(userId));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    saveContacts(userId, contacts);
  }, [contacts, userId]);

  const openAdd = () => {
    setEditingContact(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: TrustedContact) => {
    setEditingContact(c);
    setForm({ name: c.name, phone: c.phone, email: c.email || '', relationship: c.relationship || '' });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...form } : c));
    } else {
      const newContact: TrustedContact = {
        id: `c_${Date.now()}`,
        userId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        relationship: form.relationship.trim() || undefined,
        notifyOnStart: true,
        notifyOnArrival: true,
        shareLiveLocation: false,
        createdAt: new Date().toISOString(),
      };
      setContacts(prev => [newContact, ...prev]);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingContact(null);
  };

  const handleDelete = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  const toggleSetting = (id: string, field: 'notifyOnStart' | 'notifyOnArrival' | 'shareLiveLocation') => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: !c[field] } : c));
  };

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Trusted Contacts</h1>
            <p className="text-gray-500 font-medium">Manage who can track your journeys</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1b3a2a] text-white rounded-xl font-semibold text-sm shadow-md hover:bg-[#234d38] transition-all"
          >
            <Plus size={16} /> Add Contact
          </motion.button>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {contacts.length === 0 ? (
            <div className="text-center py-10">
              <Users size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No trusted contacts yet</p>
              <p className="text-xs text-gray-400 mt-1">Add contacts to share your journey status</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {contacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-gray-50 rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1b3a2a]/10 border border-[#1b3a2a]/10 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-[#1b3a2a]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm text-gray-900">{contact.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500">{contact.phone}</span>
                              {contact.relationship && (
                                <span className="text-[10px] font-medium text-[#1b3a2a] bg-[#1b3a2a]/5 px-2 py-0.5 rounded-lg">{contact.relationship}</span>
                              )}
                            </div>
                            {contact.email && <p className="text-[11px] text-gray-400 mt-0.5">{contact.email}</p>}
                          </div>
                          <button onClick={() => openEdit(contact)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-200/60">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Switch
                              checked={contact.notifyOnStart}
                              onCheckedChange={() => toggleSetting(contact.id, 'notifyOnStart')}
                            />
                            <span className="text-[10px] font-medium text-gray-500">Notify on Start</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Switch
                              checked={contact.notifyOnArrival}
                              onCheckedChange={() => toggleSetting(contact.id, 'notifyOnArrival')}
                            />
                            <span className="text-[10px] font-medium text-gray-500">Notify on Arrival</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Switch
                              checked={contact.shareLiveLocation}
                              onCheckedChange={() => toggleSetting(contact.id, 'shareLiveLocation')}
                            />
                            <span className="text-[10px] font-medium text-gray-500">Live Location</span>
                          </label>
                          {deleteConfirm === contact.id ? (
                            <div className="flex items-center gap-1 ml-auto">
                              <button onClick={() => handleDelete(contact.id)} className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors">Confirm</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(contact.id)} className="ml-auto text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDialogOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } }}
              exit={{ opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.18 } }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[28px] p-7 w-full max-w-md shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1b3a2a] flex items-center justify-center">
                    <Users size={16} className="text-[#c5f02c]" />
                  </div>
                  <h2 className="font-bold text-lg text-gray-900">{editingContact ? 'Edit Contact' : 'Add Contact'}</h2>
                </div>
                <button onClick={() => setDialogOpen(false)} className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Name</label>
                  <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#1b3a2a] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#1b3a2a] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Email (optional)</label>
                  <input value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#1b3a2a] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Relationship (optional)</label>
                  <input value={form.relationship} onChange={(e) => setForm(p => ({ ...p, relationship: e.target.value }))} placeholder="e.g. Sister, Friend" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#1b3a2a] focus:bg-white transition-all" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setDialogOpen(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={!form.name.trim() || !form.phone.trim()} className="flex-1 py-3 rounded-2xl bg-[#1b3a2a] text-sm font-bold text-white hover:bg-[#234d38] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TrustedContactsScreen;
