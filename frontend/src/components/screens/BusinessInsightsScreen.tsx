import { motion, Variants } from 'framer-motion';
import { useState } from 'react';
import { apiPost } from '@/services/api';
import {
  Building2, IndianRupee, TrendingUp, Users, Clock, Leaf,
  BarChart3, Download, FileText, FileSpreadsheet,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const BusinessInsightsScreen = () => {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    try {
      setExporting(format);
      await apiPost(`/export/${format}`, { type: 'employee' });
    } catch {
      // Mock success
    } finally { setExporting(null); }
  };

  const metrics = [
    { label: 'Avg Employee Commute', value: '35 min', icon: Clock, color: 'bg-blue-50 text-blue-600', change: '-3 min', positive: true },
    { label: 'Cost Saved', value: '₹2.4L/month', icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600', change: '+12%', positive: true },
    { label: 'Productivity Gain', value: '18%', icon: TrendingUp, color: 'bg-[#f4f7eb] text-[#1b3a2a]', change: '+4%', positive: true },
    { label: 'Attendance Rate', value: '94%', icon: Users, color: 'bg-purple-50 text-purple-600', change: '+2%', positive: true },
    { label: 'Commute Health', value: '82/100', icon: BarChart3, color: 'bg-amber-50 text-amber-600', change: '+5', positive: true },
    { label: 'Sustainability Score', value: '76/100', icon: Leaf, color: 'bg-green-50 text-green-600', change: '+8', positive: true },
    { label: 'Carbon Reduction', value: '12.5 tons', icon: Leaf, color: 'bg-teal-50 text-teal-600', change: '+15%', positive: true },
    { label: 'Late Arrivals', value: '8%', icon: Clock, color: 'bg-red-50 text-red-600', change: '-3%', positive: true },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Business Insights</h1>
          <p className="text-gray-500 font-medium">Enterprise analytics, sustainability & productivity metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('pdf')} disabled={!!exporting} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 disabled:opacity-50">
            <FileText size={14} /> {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </button>
          <button onClick={() => handleExport('csv')} disabled={!!exporting} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 disabled:opacity-50">
            <FileSpreadsheet size={14} /> {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center`}><card.icon size={16} /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs font-medium text-gray-500">{card.label}</p>
            </div>
            <p className={`text-xs font-bold mt-1 ${card.positive ? 'text-emerald-600' : 'text-red-600'}`}>{card.change} vs last month</p>
          </div>
        ))}
      </motion.div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-base text-gray-900 mb-4">Commute Health Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Safety Score', value: 92, color: 'bg-emerald-500' },
              { label: 'Comfort Score', value: 78, color: 'bg-blue-500' },
              { label: 'Punctuality', value: 88, color: 'bg-[#1b3a2a]' },
              { label: 'Sustainability', value: 76, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}/100</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-base text-gray-900 mb-4">Sustainability Impact</h3>
          <div className="space-y-3">
            {[
              { label: 'Carbon Reduced', value: '12.5 tons CO₂', desc: 'Equivalent to 625 trees planted' },
              { label: 'Public Transport Usage', value: '72%', desc: 'Up from 65% last quarter' },
              { label: 'Carpool Adoption', value: '28%', desc: '15% increase from last month' },
              { label: 'Walking/Cycling', value: '18%', desc: 'Active commute adoption rate' },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-[#1b3a2a]">{item.value}</span>
                </div>
                <p className="text-[10px] text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BusinessInsightsScreen;
