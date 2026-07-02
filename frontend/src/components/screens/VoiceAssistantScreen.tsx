import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Home, Route, Share2, MapPin, Clock,
  Hospital, Shield, Loader2, ChevronRight, MessageSquare,
  Brain, History,
} from 'lucide-react';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface CommandEntry {
  command: string;
  response: string;
  timestamp: number;
}

const quickCommands = [
  { icon: Home, label: 'Take me home', command: 'navigate home' },
  { icon: Route, label: 'Plan safest route', command: 'plan safest route' },
  { icon: Share2, label: 'Share my journey', command: 'share my journey' },
  { icon: MapPin, label: 'Where am I?', command: 'where am i' },
  { icon: Clock, label: 'Am I late?', command: 'am i late' },
  { icon: Hospital, label: 'Nearest hospital', command: 'nearest hospital' },
  { icon: Shield, label: 'Nearest police station', command: 'nearest police station' },
];

function generateMockResponse(command: string): string {
  const lower = command.toLowerCase();
  if (lower.includes('home')) return 'Planning the safest route to your home address. Estimated arrival in 28 minutes via Western Express Highway. Traffic is light.';
  if (lower.includes('safest')) return 'The safest route avoids 2 high-risk areas. Recommended: Metro Line 1 from Andheri to BKC. Well-lit stations with security patrols.';
  if (lower.includes('share')) return 'Your journey is now being shared with Priya and Rahul. Share code: FC-JNY-8421. They can track your progress in real-time.';
  if (lower.includes('where') || lower.includes('location')) return 'You are currently at Andheri Station, Platform 2, near the ticket counter. Coordinates: 19.1136° N, 72.8697° E.';
  if (lower.includes('late')) return "You're on schedule! Current ETA is 09:14 AM. No delays reported on Metro Line 1. You have 12 minutes of buffer time.";
  if (lower.includes('hospital')) return 'The nearest hospital is SevenHills Hospital, 1.2 km away. Estimated travel time: 6 minutes by auto. Emergency number: 102.';
  if (lower.includes('police')) return 'The nearest police station is Andheri Police Station, 0.8 km away. Contact: 100 for emergencies. Well-lit path via SV Road.';
  return `I understood "${command}". Let me look into that for you. Currently, your route from Andheri to BKC is on track with no disruptions.`;
}

const VoiceAssistantScreen = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<CommandEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const processCommand = (commandText: string) => {
    setIsProcessing(true);
    setTranscript(commandText);
    setShowHistory(false);

    setTimeout(() => {
      const mockResponse = generateMockResponse(commandText);
      setResponse(mockResponse);
      setIsProcessing(false);

      setHistory(prev => [
        { command: commandText, response: mockResponse, timestamp: Date.now() },
        ...prev,
      ].slice(0, 20));
    }, 1200);
  };

  const handleMicToggle = () => {
    if (isListening) {
      setIsListening(false);
      if (transcript.trim()) {
        processCommand(transcript);
      }
    } else {
      setIsListening(true);
      setTranscript('');
      setResponse('');
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[800px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Voice Assistant</h1>
        <p className="text-gray-500 font-medium">Use your voice to navigate, plan, and get help</p>
      </motion.div>

      <div className="flex flex-col items-center mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMicToggle}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isListening
              ? 'bg-red-500 shadow-red-500/30'
              : 'bg-[#1b3a2a] shadow-[#1b3a2a]/20'
          }`}
        >
          {isListening ? (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-300"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
              <Mic size={28} className="text-white relative z-10" />
            </>
          ) : (
            <Mic size={28} className="text-[#c5f02c]" />
          )}
        </motion.button>
        <p className="text-sm font-medium text-gray-500 mt-4">
          {isListening ? 'Listening... tap to stop' : 'Tap to speak'}
        </p>
      </div>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={14} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">You said</p>
                <p className="text-sm font-medium text-gray-900">{transcript}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gray-50 rounded-2xl border border-gray-100 p-5 mb-4"
          >
            <div className="flex items-center gap-3">
              <Brain size={16} className="text-[#1b3a2a]" />
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-600">Processing</span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-sm text-gray-400"
                >...</motion.span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {response && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#1b3a2a] rounded-2xl p-5 text-white mb-8"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Brain size={14} className="text-[#c5f02c]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#c5f02c] uppercase tracking-wider mb-1">AI Response</p>
                <p className="text-sm leading-relaxed text-white/90">{response}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-gray-900">Quick Commands</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-xs font-semibold text-[#3c7689] hover:underline"
          >
            <History size={12} /> {showHistory ? 'Show Commands' : 'Recent'}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {quickCommands.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => processCommand(cmd.command)}
                className="flex items-center gap-1.5 flex-shrink-0 px-3.5 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all"
              >
                <Icon size={13} className="text-[#1b3a2a]" />
                {cmd.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {showHistory && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">Recent Commands</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {history.map((entry, i) => (
              <div key={entry.timestamp} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={12} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{entry.command}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{entry.response}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {showHistory && history.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
        >
          <p className="text-sm text-gray-400">No commands yet. Try saying something!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VoiceAssistantScreen;
