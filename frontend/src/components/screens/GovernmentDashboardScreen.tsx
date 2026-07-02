import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiGet } from '@/services/api';
import {
  Building2, Users, AlertTriangle, MapPin, RefreshCw,
  Train, Car, Droplets, Construction, Siren, Signal, Clock,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const GovernmentDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGet<any>('/government/dashboard');
      setData(res);
    } catch {
      setData({
        cityAnalytics: { population: 20700000, activeCommuters: 8500000, publicTransportUsers: 3200000, avgCommuteTime: 42, congestionIndex: 72, airQualityIndex: 156 },
        trafficHeatmap: [
          { zone: 'South Mumbai', congestion: 85, vehicles: 125000, avgSpeed: 12 },
          { zone: 'Western Suburbs', congestion: 78, vehicles: 98000, avgSpeed: 18 },
          { zone: 'Eastern Suburbs', congestion: 65, vehicles: 72000, avgSpeed: 22 },
          { zone: 'Navi Mumbai', congestion: 45, vehicles: 45000, avgSpeed: 30 },
        ],
        floodZones: [
          { id: 'fz1', area: 'Hindmata', level: 'high', waterLevel: 2.5, status: 'active' },
          { id: 'fz2', area: 'Sion', level: 'medium', waterLevel: 1.2, status: 'monitoring' },
        ],
        metroCongestion: [
          { line: 'Line 1 (Versova-AGNE)', occupancy: 85, status: 'crowded', nextTrain: '2 min' },
          { line: 'Line 3 (Aqua Line)', occupancy: 45, status: 'comfortable', nextTrain: '5 min' },
        ],
        roadClosures: [
          { id: 'rc1', road: 'Marine Drive', reason: 'VIP Movement', from: '10:00 AM', to: '12:00 PM', status: 'active' },
        ],
        emergencyVehicles: [
          { id: 'ev1', type: 'Ambulance', location: 'Western Express', destination: 'Breach Candy Hospital', eta: '12 min', status: 'active' },
        ],
        signalStatus: [
          { junction: 'Hindmata Signal', status: 'green', cycle: '90 sec', congestion: 'high' },
          { junction: 'Dadar TT Circle', status: 'red', cycle: '120 sec', congestion: 'medium' },
        ],
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
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Smart City Dashboard</h1>
          <p className="text-gray-500 font-medium">City analytics, traffic, flood zones & emergency vehicles</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Congestion Index', value: `${data.cityAnalytics.congestionIndex}`, icon: Car, color: 'bg-amber-50 text-amber-600' },
          { label: 'Active Commuters', value: `${(data.cityAnalytics.activeCommuters / 1000000).toFixed(1)}M`, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Avg Commute', value: `${data.cityAnalytics.avgCommuteTime} min`, icon: Clock, color: 'bg-[#f4f7eb] text-[#1b3a2a]' },
          { label: 'Air Quality', value: data.cityAnalytics.airQualityIndex, icon: Droplets, color: data.cityAnalytics.airQualityIndex > 150 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600' },
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
          {/* Traffic Heatmap */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-5">Traffic Heatmap</h3>
            <div className="space-y-3">
              {data.trafficHeatmap?.map((zone: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">{zone.zone}</span>
                      <span className="text-xs font-bold text-gray-500">{zone.vehicles.toLocaleString()} vehicles · {zone.avgSpeed} km/h</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${zone.congestion > 80 ? 'bg-red-500' : zone.congestion > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${zone.congestion}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">{zone.congestion}% congestion</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Metro Congestion */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-5">Metro Congestion</h3>
            <div className="space-y-3">
              {data.metroCongestion?.map((metro: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <Train size={16} className="text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{metro.line}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${metro.occupancy > 80 ? 'bg-red-500' : metro.occupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${metro.occupancy}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-500">{metro.occupancy}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">Next: {metro.nextTrain}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Flood Zones */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Flood Zones</h3>
            <div className="space-y-3">
              {data.floodZones?.map((fz: any) => (
                <div key={fz.id} className={`p-3 rounded-xl border ${fz.level === 'high' ? 'bg-red-50 border-red-200' : fz.level === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900">{fz.area}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${fz.level === 'high' ? 'bg-red-100 text-red-700' : fz.level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {fz.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Water: {fz.waterLevel}m · {fz.status}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Road Closures */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Road Closures</h3>
            <div className="space-y-2">
              {data.roadClosures?.map((rc: any) => (
                <div key={rc.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Construction size={12} className="text-amber-600" />
                    <span className="text-sm font-bold text-gray-900">{rc.road}</span>
                  </div>
                  <p className="text-xs text-gray-600">{rc.reason} · {rc.from} - {rc.to}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Emergency Vehicles */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Emergency Vehicles</h3>
            <div className="space-y-2">
              {data.emergencyVehicles?.map((ev: any) => (
                <div key={ev.id} className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Siren size={12} className="text-blue-600" />
                    <span className="text-sm font-bold text-gray-900">{ev.type}</span>
                  </div>
                  <p className="text-xs text-gray-600">{ev.location} → {ev.destination}</p>
                  <p className="text-xs font-bold text-blue-600 mt-1">ETA: {ev.eta}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default GovernmentDashboardScreen;
