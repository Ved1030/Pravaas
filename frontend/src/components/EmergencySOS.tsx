import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Phone, MapPin, CheckCircle2, X, Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type SOSState = 'idle' | 'confirming' | 'sent' | 'resolved';

const EmergencySOS = () => {
  const [state, setState] = useState<SOSState>('idle');
  const [open, setOpen] = useState(false);

  const handleSOSTrigger = () => {
    setState('confirming');
    setOpen(true);
  };

  const handleSend = () => {
    setState('sent');
  };

  const handleResolve = () => {
    setState('resolved');
    setTimeout(() => {
      setOpen(false);
      setState('idle');
    }, 500);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setState('idle'), 200);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleSOSTrigger}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-red-600 shadow-lg shadow-red-600/30 flex items-center justify-center hover:bg-red-700 transition-colors"
      >
        <motion.div
          animate={{
            boxShadow: ['0 0 0 0 rgba(220,38,38,0.4)', '0 0 0 12px rgba(220,38,38,0)'],
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-0 rounded-full"
        />
        <div className="relative flex flex-col items-center">
          <AlertTriangle size={16} className="text-white" />
          <span className="text-[8px] font-extrabold text-white leading-none mt-0.5">SOS</span>
        </div>
      </motion.button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="sm:max-w-sm">
          <AnimatePresence mode="wait">
            {state === 'confirming' && (
              <motion.div
                key="confirming"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                    <AlertTriangle size={24} className="text-red-600" />
                  </div>
                  <DialogTitle className="text-center text-red-600">Send Emergency Alert?</DialogTitle>
                  <DialogDescription className="text-center">
                    Your location and journey details will be shared with your trusted contacts and emergency services.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-gray-50 rounded-xl p-3 mx-6 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="font-semibold">Current Location</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">Shivaji Nagar, Pune</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Lat: 18.5204° N, Lng: 73.8567° E</p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={handleClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSend} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    <Phone size={14} className="mr-1" />
                    Send Alert
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {state === 'sent' && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                    <CheckCircle2 size={24} className="text-emerald-600" />
                  </div>
                  <DialogTitle className="text-center text-emerald-600">Emergency Alert Sent</DialogTitle>
                  <DialogDescription className="text-center">
                    Your trusted contacts and emergency services have been notified. Help is on the way.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 size={14} className="text-emerald-500 animate-spin" />
                  <span className="text-xs font-medium text-emerald-600">Awaiting response...</span>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={handleResolve}
                    className="w-full"
                  >
                    <X size={14} className="mr-1" />
                    Resolve Alert
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {state === 'resolved' && (
              <motion.div
                key="resolved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-center">Alert Resolved</DialogTitle>
                  <DialogDescription className="text-center">
                    Stay safe. You can send a new alert anytime.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={handleClose} className="w-full bg-[#1b3a2a] hover:bg-[#1b3a2a]/90 text-white">
                    Done
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmergencySOS;
