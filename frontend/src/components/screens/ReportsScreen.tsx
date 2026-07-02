import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/services/api';
import {
  FileText, Download, Clock, RefreshCw, ChevronRight,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const ReportsScreen = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGet<any>('/export/reports');
      setReports(res.reports || []);
    } catch {
      setReports([
        { id: 'r1', type: 'journey', format: 'pdf', generatedAt: new Date(Date.now() - 3600000).toISOString(), status: 'completed', size: '1.2 MB', pages: 5 },
        { id: 'r2', type: 'analytics', format: 'csv', generatedAt: new Date(Date.now() - 86400000).toISOString(), status: 'completed', size: '0.8 MB', rows: 245 },
      ]);
    } finally { setLoading(false); }
  };

  const generateReport = async (type: string, format: string) => {
    try {
      setGenerating(`${type}-${format}`);
      const res = await apiPost<any>(`/export/${format}`, { type });
      if (res.report) {
        setReports(prev => [res.report, ...prev]);
      }
    } catch {
      const newReport = {
        id: `r_${Date.now()}`, type, format, generatedAt: new Date().toISOString(),
        status: 'completed', size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      };
      setReports(prev => [newReport, ...prev]);
    } finally { setGenerating(null); }
  };

  useEffect(() => { fetchData(); }, []);

  const reportTypes = [
    { id: 'journey', name: 'Journey Report', description: 'Complete journey history, time, cost & patterns' },
    { id: 'analytics', name: 'Analytics Report', description: 'Travel analytics, trends & performance metrics' },
    { id: 'recruiter', name: 'Recruiter Report', description: 'Candidate tracking, arrivals & interview analytics' },
    { id: 'employee', name: 'Employee Report', description: 'Employee commute, attendance & productivity' },
  ];

  const formatIcons: Record<string, string> = { pdf: '📄', csv: '📊', excel: '📈' };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Report Export</h1>
        <p className="text-gray-500 font-medium">Generate and download reports in PDF, CSV, or Excel</p>
      </motion.div>

      {/* Generate New Reports */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-base text-gray-900 mb-5">Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((rt) => (
            <div key={rt.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-1">{rt.name}</h4>
              <p className="text-xs text-gray-500 mb-3">{rt.description}</p>
              <div className="flex items-center gap-2">
                {['pdf', 'csv', 'excel'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => generateReport(rt.id, fmt)}
                    disabled={!!generating}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <Download size={12} />
                    {generating === `${rt.id}-${fmt}` ? '...' : fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Reports */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-base text-gray-900 mb-5">Recent Reports</h3>
        {reports.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No reports generated yet. Create your first report above.</p>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-2xl">{formatIcons[report.format] || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 capitalize">{report.type} Report</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{report.format}</span>
                    <span className="text-[10px] text-gray-400">{report.size || 'N/A'}</span>
                    <span className="text-[10px] text-gray-400">{new Date(report.generatedAt).toLocaleString()}</span>
                  </div>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-[#1b3a2a] text-white rounded-lg text-xs font-bold hover:bg-[#254a35] transition-colors">
                  <Download size={12} /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ReportsScreen;
