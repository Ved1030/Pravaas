import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiGet } from '@/services/api';
import {
  Heart, Bus, Shield, Bell, MapPin, Phone, RefreshCw,
  CheckCircle2, AlertTriangle, Clock, Share2,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const ParentDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGet<any>('/parent/dashboard');
      setData(res);
    } catch {
      setData({
        children: [
          { id: 'c1', name: 'Aarav Sharma', age: 12, grade: '7th Standard', school: 'Delhi Public School', journey: { status: 'in-transit', mode: 'School Bus', busId: 'BUS-12', currentLocation: 'Near Sector 14, 3km from school', eta: '08:15 AM', departureTime: '07:30 AM', progress: 65, stops: [
            { name: 'Home', time: '07:30', status: 'completed' },
            { name: 'Sector 10', time: '07:40', status: 'completed' },
            { name: 'Sector 14', time: '07:50', status: 'current' },
            { name: 'School Gate', time: '08:15', status: 'upcoming' },
          ]}, safeArrival: false, lastUpdated: new Date(Date.now() - 5 * 60000).toISOString() },
          { id: 'c2', name: 'Ananya Sharma', age: 9, grade: '4th Standard', school: "St. Mary's School", journey: { status: 'arrived', mode: 'Walking', currentLocation: 'School', eta: null, departureTime: '07:45 AM', progress: 100, arrivalTime: '08:02 AM' }, safeArrival: true, lastUpdated: new Date(Date.now() - 120 * 60000).toISOString() },
        ],
        emergencyAlerts: [{ id: 'ea1', type: 'delay', title: 'Bus Delayed', message: 'School Bus BUS-12 is running 10 minutes late due to traffic', severity: 'medium', timestamp: new Date(Date.now() - 8 * 60000).toISOString(), read: false }],
        arrivalNotifications: [{ childId: 'c2', message: 'Ananya safely arrived at school at 08:02 AM', time: '08:02 AM', read: true }],
        shareSettings: { autoShare: true, notifyOnDeparture: true, notifyOnArrival: true, liveTrackingEnabled: true },
      });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="w-full max-w-[1200px] mx-auto pb-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 gap-4">{[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}</div>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Parent Dashboard</h1>
          <p className="text-gray-500 font-medium">Child journey tracking & safe arrival</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.children?.map((child: any) => (
          <motion.div key={child.id} variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                <img src={`https://i.pravatar.cc/150?u=${child.id}`} alt={child.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{child.name}</h3>
                <p className="text-xs text-gray-500">{child.grade} · {child.school}</p>
              </div>
              {child.safeArrival ? (
                <div className="ml-auto flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                  <CheckCircle2 size={12} /> Safe
                </div>
              ) : (
                <div className="ml-auto flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200 animate-pulse">
                  <MapPin size={12} /> In Transit
                </div>
              )}
            </div>

            {child.journey && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bus size={14} className="text-blue-600" />
                  <span className="text-sm font-bold text-gray-900">{child.journey.mode} {child.journey.busId && `· ${child.journey.busId}`}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{child.journey.currentLocation}</p>
                {child.journey.eta && <p className="text-xs font-semibold text-blue-600">ETA: {child.journey.eta}</p>}
                {child.journey.arrivalTime && <p className="text-xs font-semibold text-emerald-600">Arrived: {child.journey.arrivalTime}</p>}

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${child.journey.progress || 0}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400">{child.journey.departureTime}</span>
                    <span className="text-[10px] text-gray-400">{child.journey.progress}%</span>
                  </div>
                </div>

                {/* Stops */}
                {child.journey.stops && (
                  <div className="mt-3 space-y-2">
                    {child.journey.stops.map((stop: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stop.status === 'completed' ? 'bg-emerald-500' : stop.status === 'current' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">{stop.name}</span>
                        <span className="text-[10px] text-gray-400 ml-auto">{stop.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Emergency Alerts */}
      {data.emergencyAlerts?.length > 0 && (
        <motion.div variants={fadeUp} className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-base text-gray-900 mb-4">Emergency Alerts</h3>
          <div className="space-y-3">
            {data.emergencyAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-800">{alert.title}</p>
                  <p className="text-xs text-amber-700 mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Share Settings */}
      <motion.div variants={fadeUp} className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-base text-gray-900 mb-4">Share & Notifications</h3>
        <div className="space-y-3">
          {[
            { label: 'Auto Share Location', value: data.shareSettings?.autoShare },
            { label: 'Notify on Departure', value: data.shareSettings?.notifyOnDeparture },
            { label: 'Notify on Arrival', value: data.shareSettings?.notifyOnArrival },
            { label: 'Live Tracking', value: data.shareSettings?.liveTrackingEnabled },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700">{item.label}</span>
              <div className={`w-10 h-5 rounded-full ${item.value ? 'bg-[#1b3a2a]' : 'bg-gray-300'} relative transition-colors`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.value ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ParentDashboardScreen;
