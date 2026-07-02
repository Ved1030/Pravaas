import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiGet } from '@/services/api';
import {
  Building2, Users, Clock, Car, CloudRain, TrendingUp, MapPin,
  BarChart3, RefreshCw, UserCheck, UserX, AlertTriangle, Timer, Sun,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

interface Employee {
  id: string;
  name: string;
  department: string;
  status: string;
  delay: number;
  arrivalTime: string | null;
  commuteMode: string;
}

interface DashboardData {
  employees: Employee[];
  summary: {
    total: number;
    arrived: number;
    onWay: number;
    late: number;
    remote: number;
    onLeave: number;
    attendanceRate: number;
    lateRate: number;
    peakHour: string;
    parkingOccupancy: number;
    rainImpact: string;
    hybridRecommendation: string;
  };
  commuteBreakdown: Record<string, number>;
  travelHeatmap: { zone: string; employees: number; avgTime: number }[];
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  arrived: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'on-way': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  late: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  remote: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  leave: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const modeIcons: Record<string, string> = { metro: '🚇', bus: '🚌', auto: '🛺', car: '🚗', walk: '🚶' };

const CorporateDashboardScreen = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGet<DashboardData>('/corporate/dashboard');
      setData(res);
    } catch {
      generateMock();
    } finally { setLoading(false); }
  };

  const generateMock = () => {
    const employees: Employee[] = [
      { id: '1', name: 'Rahul Sharma', department: 'Engineering', status: 'arrived', delay: 0, arrivalTime: '08:52', commuteMode: 'metro' },
      { id: '2', name: 'Priya Patel', department: 'Product', status: 'on-way', delay: 0, arrivalTime: null, commuteMode: 'bus' },
      { id: '3', name: 'Amit Kumar', department: 'Design', status: 'late', delay: 15, arrivalTime: null, commuteMode: 'auto' },
      { id: '4', name: 'Sneha Reddy', department: 'Engineering', status: 'remote', delay: 0, arrivalTime: null, commuteMode: 'car' },
      { id: '5', name: 'Vikram Singh', department: 'Marketing', status: 'arrived', delay: 0, arrivalTime: '08:45', commuteMode: 'metro' },
      { id: '6', name: 'Neha Gupta', department: 'Sales', status: 'on-way', delay: 5, arrivalTime: null, commuteMode: 'bus' },
      { id: '7', name: 'Sanjay Mehta', department: 'HR', status: 'arrived', delay: 0, arrivalTime: '08:58', commuteMode: 'walk' },
      { id: '8', name: 'Kavita Iyer', department: 'Finance', status: 'leave', delay: 0, arrivalTime: null, commuteMode: 'metro' },
      { id: '9', name: 'Deepak Nair', department: 'Engineering', status: 'arrived', delay: 0, arrivalTime: '08:30', commuteMode: 'metro' },
      { id: '10', name: 'Ananya Desai', department: 'Operations', status: 'on-way', delay: 10, arrivalTime: null, commuteMode: 'auto' },
    ];
    setData({
      employees,
      summary: {
        total: 10, arrived: 4, onWay: 3, late: 1, remote: 1, onLeave: 1,
        attendanceRate: 90, lateRate: 10, peakHour: '09:00 - 09:30',
        parkingOccupancy: 72, rainImpact: 'Moderate - 15% may be delayed',
        hybridRecommendation: 'Current hybrid policy is effective',
      },
      commuteBreakdown: { metro: 4, bus: 2, auto: 2, car: 1, walk: 1 },
      travelHeatmap: [
        { zone: 'Andheri', employees: 3, avgTime: 35 },
        { zone: 'BKC', employees: 0, avgTime: 0 },
        { zone: 'Dadar', employees: 2, avgTime: 25 },
        { zone: 'Bandra', employees: 2, avgTime: 20 },
        { zone: 'Powai', employees: 1, avgTime: 15 },
        { zone: 'Thane', employees: 1, avgTime: 45 },
      ],
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
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { employees, summary, commuteBreakdown, travelHeatmap } = data;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Corporate Dashboard</h1>
          <p className="text-gray-500 font-medium">Employee attendance, commute analytics & hybrid insights</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
          <RefreshCw size={14} /> Refresh
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Attendance', value: `${summary.attendanceRate}%`, icon: UserCheck, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Late Employees', value: summary.late, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Rain Impact', value: 'Moderate', icon: CloudRain, color: 'bg-blue-50 text-blue-600' },
          { label: 'Parking', value: `${summary.parkingOccupancy}%`, icon: Car, color: 'bg-[#f4f7eb] text-[#1b3a2a]' },
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
          {/* Employee List */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-gray-900">Employee Arrivals</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{summary.arrived} arrived, {summary.onWay} on way, {summary.late} late</p>
              </div>
            </div>
            <div className="space-y-2">
              {employees.map((e) => {
                const sc = statusColors[e.status] || statusColors.leave;
                return (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${sc.dot} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 truncate">{e.name}</p>
                        <span className={`text-[10px] font-bold uppercase ${sc.text}`}>{e.status.replace('-', ' ')}</span>
                      </div>
                      <p className="text-xs text-gray-500">{e.department} · {modeIcons[e.commuteMode]} {e.commuteMode}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {e.arrivalTime && <p className="text-sm font-bold text-gray-900">{e.arrivalTime}</p>}
                      {e.delay > 0 && <p className="text-xs text-amber-600 font-semibold">+{e.delay} min</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Commute Breakdown & Peak Hour */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-base text-gray-900 mb-4">Commute Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(commuteBreakdown).map(([mode, count]) => (
                  <div key={mode} className="flex items-center gap-3">
                    <span className="text-lg">{modeIcons[mode]}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700 capitalize">{mode}</span>
                        <span className="text-xs font-bold text-gray-500">{count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1b3a2a] rounded-full" style={{ width: `${(count / summary.total) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-base text-gray-900 mb-4">Office Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Peak Arrival Time</p>
                  <p className="text-sm font-bold text-gray-900">{summary.peakHour}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Rain Impact</p>
                  <p className="text-sm font-bold text-gray-900">{summary.rainImpact}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Hybrid Recommendation</p>
                  <p className="text-sm font-bold text-[#1b3a2a]">{summary.hybridRecommendation}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Travel Heatmap */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Travel Heatmap</h3>
            <div className="space-y-3">
              {travelHeatmap.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">{h.zone}</span>
                      <span className="text-xs font-bold text-gray-500">{h.employees} employees</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1b3a2a] rounded-full" style={{ width: `${(h.employees / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Commute Analytics */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Commute Analytics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">On Time</span>
                <span className="text-sm font-bold text-emerald-600">{summary.total - summary.late - summary.remote - summary.onLeave}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Late</span>
                <span className="text-sm font-bold text-amber-600">{summary.late}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Remote</span>
                <span className="text-sm font-bold text-purple-600">{summary.remote}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">On Leave</span>
                <span className="text-sm font-bold text-gray-600">{summary.onLeave}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CorporateDashboardScreen;
