import { motion, Variants } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { apiGet, apiPost } from '@/services/api';
import {
  Users, Clock, AlertTriangle, TrendingUp, Calendar, Video,
  MapPin, BarChart3, ChevronRight, ArrowUpRight, ArrowDownRight,
  UserCheck, UserX, Timer, Building, RefreshCw,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

interface Candidate {
  id: string;
  name: string;
  role: string;
  status: string;
  eta: string;
  etaFormatted: string;
  arrivalConfidence: string;
  predictedDelay: number;
  noShowRisk: string;
  noShowProbability: number;
  interviewTime: string;
  interviewTimeFormatted: string;
  location: string;
  interviewer: string;
  recommendation: string;
  virtualSuggested: boolean;
}

interface DashboardData {
  candidates: Candidate[];
  summary: {
    totalInterviews: number;
    arrived: number;
    onWay: number;
    noShows: number;
    noShowRate: number;
    avgDelay: number;
    avgArrivalTime: number;
  };
  heatmapData: { location: string; interviews: number; density: string }[];
  timeline: { id: string; name: string; interviewTime: string; status: string; eta: string }[];
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  'arrived': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'on-way': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'completed': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  'no-show': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'scheduled': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

const confidenceColors: Record<string, string> = {
  high: 'text-emerald-600',
  medium: 'text-amber-600',
  low: 'text-red-600',
};

const RecruiterDashboardScreen = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGet<DashboardData>('/recruiter/dashboard');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const candidates: Candidate[] = [
      { id: 'c1', name: 'Priya Sharma', role: 'Software Engineer', status: 'on-way', eta: '', etaFormatted: '09:15 AM', arrivalConfidence: 'high', predictedDelay: 0, noShowRisk: 'low', noShowProbability: 0.1, interviewTime: '', interviewTimeFormatted: '09:30 AM', location: 'Building A, Floor 2', interviewer: 'Rahul Mehta', recommendation: 'No action needed', virtualSuggested: false },
      { id: 'c2', name: 'Arjun Patel', role: 'Data Scientist', status: 'arrived', eta: '', etaFormatted: '', arrivalConfidence: 'high', predictedDelay: 0, noShowRisk: 'low', noShowProbability: 0.05, interviewTime: '', interviewTimeFormatted: '10:00 AM', location: 'Building A, Floor 3', interviewer: 'Neha Gupta', recommendation: 'No action needed', virtualSuggested: false },
      { id: 'c3', name: 'Neha Gupta', role: 'UX Designer', status: 'on-way', eta: '', etaFormatted: '09:45 AM', arrivalConfidence: 'medium', predictedDelay: 10, noShowRisk: 'medium', noShowProbability: 0.35, interviewTime: '', interviewTimeFormatted: '10:30 AM', location: 'Building B, Floor 1', interviewer: 'Sanjay Rao', recommendation: 'Send reminder message', virtualSuggested: false },
      { id: 'c4', name: 'Rahul Verma', role: 'Product Manager', status: 'scheduled', eta: '', etaFormatted: '11:00 AM', arrivalConfidence: 'low', predictedDelay: 20, noShowRisk: 'high', noShowProbability: 0.72, interviewTime: '', interviewTimeFormatted: '11:30 AM', location: 'Building A, Floor 1', interviewer: 'Meera Reddy', recommendation: 'Consider reschedule to virtual', virtualSuggested: true },
      { id: 'c5', name: 'Ananya Singh', role: 'Frontend Developer', status: 'no-show', eta: '', etaFormatted: '', arrivalConfidence: 'low', predictedDelay: 0, noShowRisk: 'high', noShowProbability: 0.95, interviewTime: '', interviewTimeFormatted: '09:00 AM', location: 'Building A, Floor 2', interviewer: 'Vikram Joshi', recommendation: 'Contact candidate immediately', virtualSuggested: true },
      { id: 'c6', name: 'Vikram Joshi', role: 'DevOps Engineer', status: 'on-way', eta: '', etaFormatted: '10:15 AM', arrivalConfidence: 'medium', predictedDelay: 8, noShowRisk: 'medium', noShowProbability: 0.3, interviewTime: '', interviewTimeFormatted: '10:30 AM', location: 'Building B, Floor 2', interviewer: 'Karan Mehta', recommendation: 'Send arrival reminder', virtualSuggested: false },
      { id: 'c7', name: 'Meera Reddy', role: 'ML Engineer', status: 'arrived', eta: '', etaFormatted: '', arrivalConfidence: 'high', predictedDelay: 0, noShowRisk: 'low', noShowProbability: 0.08, interviewTime: '', interviewTimeFormatted: '10:00 AM', location: 'Building A, Floor 4', interviewer: 'Pooja Desai', recommendation: 'No action needed', virtualSuggested: false },
      { id: 'c8', name: 'Karan Mehta', role: 'QA Engineer', status: 'on-way', eta: '', etaFormatted: '10:30 AM', arrivalConfidence: 'high', predictedDelay: 2, noShowRisk: 'low', noShowProbability: 0.12, interviewTime: '', interviewTimeFormatted: '11:00 AM', location: 'Building A, Floor 3', interviewer: 'Amit Kumar', recommendation: 'No action needed', virtualSuggested: false },
    ];
    setData({
      candidates,
      summary: { totalInterviews: 8, arrived: 2, onWay: 4, noShows: 1, noShowRate: 12, avgDelay: 8, avgArrivalTime: 24 },
      heatmapData: [
        { location: 'Building A, Floor 1', interviews: 2, density: 'medium' },
        { location: 'Building A, Floor 2', interviews: 3, density: 'high' },
        { location: 'Building A, Floor 3', interviews: 2, density: 'medium' },
        { location: 'Building B, Floor 1', interviews: 1, density: 'low' },
      ],
      timeline: candidates.map(c => ({ id: c.id, name: c.name, interviewTime: c.interviewTimeFormatted, status: c.status, eta: c.etaFormatted })),
    });
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto pb-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
            </div>
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { candidates, summary, heatmapData } = data;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Recruiter Dashboard</h1>
          <p className="text-gray-500 font-medium">Today's interview tracking and candidate management</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
          <RefreshCw size={14} /> Refresh
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Interviews', value: summary.totalInterviews, icon: Users, color: 'bg-[#f4f7eb] text-[#1b3a2a]' },
          { label: 'Arrived', value: summary.arrived, icon: UserCheck, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'On the Way', value: summary.onWay, icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'No-show Rate', value: `${summary.noShowRate}%`, icon: UserX, color: 'bg-red-50 text-red-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Today's Interviews */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-gray-900">Today's Interviews</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{candidates.length} candidates scheduled</p>
              </div>
            </div>
            <div className="space-y-3">
              {candidates.map((c) => {
                const sc = statusColors[c.status] || statusColors.scheduled;
                return (
                  <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${sc.bg} border ${sc.border} flex items-center justify-center flex-shrink-0`}>
                      <Users size={16} className={sc.text} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text} border ${sc.border}`}>
                          {c.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{c.role} · {c.location} · Interviewer: {c.interviewer}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs font-semibold text-gray-700">Interview: {c.interviewTimeFormatted}</span>
                        {c.etaFormatted && c.status === 'on-way' && (
                          <span className="text-xs text-blue-600 font-semibold">ETA: {c.etaFormatted}</span>
                        )}
                        <span className={`text-xs font-bold ${confidenceColors[c.arrivalConfidence]}`}>
                          {c.noShowRisk === 'high' ? `${Math.round(c.noShowProbability * 100)}% no-show risk` : `Confidence: ${c.arrivalConfidence}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {c.virtualSuggested && (
                        <button className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold border border-purple-200 hover:bg-purple-100 transition-colors">
                          <Video size={12} /> Virtual
                        </button>
                      )}
                      <span className="text-[10px] text-gray-400">{c.recommendation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Interview Heatmap */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-4">Interview Location Heatmap</h3>
            <div className="space-y-3">
              {heatmapData.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">{h.location}</span>
                      <span className="text-xs font-bold text-gray-500">{h.interviews} interviews</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${h.density === 'high' ? 'bg-red-500' : h.density === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(h.interviews / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Candidate Timeline */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Candidate Timeline</h3>
            <div className="space-y-3">
              {data.timeline.slice(0, 6).map((t, i) => {
                const sc = statusColors[t.status] || statusColors.scheduled;
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-2.5 h-2.5 rounded-full ${t.status === 'arrived' ? 'bg-emerald-500' : t.status === 'on-way' ? 'bg-blue-500' : t.status === 'no-show' ? 'bg-red-500' : 'bg-gray-300'}`} />
                      {i < data.timeline.length - 1 && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{t.interviewTime}</span>
                        {t.eta && <span className="text-xs text-blue-500">ETA: {t.eta}</span>}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${sc.text}`}>{t.status.replace('-', ' ')}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Summary Stats */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Avg Arrival Time</span>
                <span className="text-sm font-bold text-gray-900">{summary.avgArrivalTime} min early</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Avg Delay (On-way)</span>
                <span className="text-sm font-bold text-gray-900">{summary.avgDelay} min</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Arrived / On-way / No-show</span>
                <span className="text-sm font-bold text-gray-900">{summary.arrived} / {summary.onWay} / {summary.noShows}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">No-show Risk</span>
                <span className={`text-sm font-bold ${summary.noShowRate > 10 ? 'text-red-600' : 'text-emerald-600'}`}>{summary.noShowRate}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecruiterDashboardScreen;
