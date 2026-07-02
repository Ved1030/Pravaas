import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiGet } from '@/services/api';
import {
  GraduationCap, BookOpen, Bus, Clock, CloudRain, AlertTriangle,
  CheckCircle2, MapPin, Calendar, ChevronRight, Shield, RefreshCw,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const StudentDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGet<any>('/student/dashboard');
      setData(res);
    } catch {
      setData({
        classes: [
          { id: 'c1', name: 'Mathematics', time: '08:00', endTime: '08:45', room: 'Room 201', teacher: 'Mr. Sharma', status: 'completed' },
          { id: 'c2', name: 'Physics', time: '09:00', endTime: '09:45', room: 'Lab 3', teacher: 'Mrs. Iyer', status: 'completed' },
          { id: 'c3', name: 'English', time: '10:00', endTime: '10:45', room: 'Room 105', teacher: 'Ms. Patel', status: 'current' },
          { id: 'c4', name: 'Chemistry', time: '11:00', endTime: '11:45', room: 'Lab 1', teacher: 'Dr. Verma', status: 'upcoming' },
          { id: 'c5', name: 'Computer Science', time: '12:00', endTime: '12:45', room: 'Computer Lab', teacher: 'Mr. Gupta', status: 'upcoming' },
        ],
        attendancePrediction: 92,
        busTracking: { busId: 'BUS-07', driver: 'Ramesh Kumar', status: 'on-route', eta: '07:45 AM', currentLocation: 'MG Road, 2km from school', stops: [
          { name: 'Sector 5', time: '07:15', status: 'completed', students: 8 },
          { name: 'Sector 8', time: '07:25', status: 'completed', students: 6 },
          { name: 'Main Road', time: '07:35', status: 'current', students: 4 },
          { name: 'School Gate', time: '07:50', status: 'upcoming', students: 0 },
        ]},
        upcomingExam: { subject: 'Mathematics', date: '2026-07-10', day: 'Thursday', time: '10:00 AM', duration: '3 hours', venue: 'Exam Hall A', route: { suggestedLeave: '08:30 AM', mode: 'Bus + Walk', duration: '35 min' } },
        weatherAlert: { active: true, type: 'rain', message: 'Heavy rain expected between 2 PM - 5 PM. Carry umbrella.', severity: 'medium' },
        leaveReminder: { pending: 2, approved: 5, nextHoliday: 'Independence Day - August 15' },
        safeArrival: true,
      });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="w-full max-w-[1200px] mx-auto pb-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}</div>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Student Dashboard</h1>
          <p className="text-gray-500 font-medium">Classes, bus tracking & exam routes</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Attendance', value: `${data.attendancePrediction}%`, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Bus Status', value: data.busTracking?.status === 'on-route' ? 'On Route' : 'Arrived', icon: Bus, color: 'bg-blue-50 text-blue-600' },
          { label: 'Safe Arrival', value: data.safeArrival ? 'Yes' : 'No', icon: Shield, color: data.safeArrival ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600' },
          { label: 'Pending Leaves', value: data.leaveReminder?.pending || 0, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center`}><card.icon size={16} /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Today's Classes */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-5">Today's Classes</h3>
            <div className="space-y-2">
              {data.classes?.map((cls: any) => (
                <div key={cls.id} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${cls.status === 'current' ? 'bg-[#f4f7eb] border border-[#e0e8d5]' : cls.status === 'completed' ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                  <div className={`w-14 text-center flex-shrink-0`}>
                    <p className="text-xs font-bold text-gray-500">{cls.time}</p>
                  </div>
                  <div className={`w-1 h-10 rounded-full ${cls.status === 'current' ? 'bg-[#1b3a2a]' : cls.status === 'completed' ? 'bg-gray-300' : 'bg-gray-200'} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{cls.name}</p>
                    <p className="text-xs text-gray-500">{cls.room} · {cls.teacher}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${cls.status === 'current' ? 'bg-[#1b3a2a] text-white' : cls.status === 'completed' ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-500'}`}>
                    {cls.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weather Alert */}
          {data.weatherAlert?.active && (
            <motion.div variants={fadeUp} className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
              <div className="flex items-start gap-3">
                <CloudRain size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Weather Alert</p>
                  <p className="text-sm text-amber-700 mt-1">{data.weatherAlert.message}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          {/* Bus Tracking */}
          {data.busTracking && (
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-base text-gray-900 mb-4">School Bus Tracking</h3>
              <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Bus size={16} className="text-blue-600" />
                  <span className="text-sm font-bold text-blue-800">{data.busTracking.busId}</span>
                </div>
                <p className="text-xs text-blue-700">{data.busTracking.currentLocation}</p>
                <p className="text-xs font-semibold text-blue-600 mt-1">ETA: {data.busTracking.eta}</p>
              </div>
              <div className="space-y-2">
                {data.busTracking.stops?.map((stop: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${stop.status === 'completed' ? 'bg-emerald-500' : stop.status === 'current' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700">{stop.name}</p>
                      <p className="text-[10px] text-gray-400">{stop.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upcoming Exam */}
          {data.upcomingExam && (
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-base text-gray-900 mb-4">Upcoming Exam</h3>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-sm font-bold text-purple-800">{data.upcomingExam.subject}</p>
                <p className="text-xs text-purple-600 mt-1">{data.upcomingExam.date} · {data.upcomingExam.time}</p>
                <p className="text-xs text-purple-600">{data.upcomingExam.venue}</p>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Suggested Route</p>
                  <p className="text-xs text-purple-700 mt-1">Leave by {data.upcomingExam.route.suggestedLeave} · {data.upcomingExam.route.mode} · {data.upcomingExam.route.duration}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboardScreen;
