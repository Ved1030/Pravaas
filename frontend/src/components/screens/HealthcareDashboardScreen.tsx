import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiGet } from '@/services/api';
import {
  Heart, Stethoscope, Ambulance, Clock, MapPin, AlertTriangle,
  RefreshCw, CheckCircle2, Navigation, Phone,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const HealthcareDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGet<any>('/healthcare/dashboard');
      setData(res);
    } catch {
      setData({
        emergencyStaff: [
          { id: 'd1', name: 'Dr. Priya Sharma', role: 'Cardiologist', status: 'on-way', eta: '15 min', delay: 5, location: 'Western Express Highway' },
          { id: 'd2', name: 'Dr. Amit Patel', role: 'Neurologist', status: 'arrived', eta: null, delay: 0, location: 'Hospital' },
          { id: 'd3', name: 'Dr. Neha Gupta', role: 'Surgeon', status: 'on-way', eta: '25 min', delay: 12, location: 'BKC Flyover' },
          { id: 'd4', name: 'Dr. Sanjay Rao', role: 'Emergency Physician', status: 'delayed', eta: '40 min', delay: 20, location: 'Andheri Station' },
        ],
        hospitalArrival: { totalStaff: 48, arrived: 35, onWay: 10, delayed: 2, onLeave: 1, shiftStart: '08:00 AM', criticalCoverage: '85%', erWaitTime: 18 },
        ambulancePriority: [
          { id: 'a1', type: 'Cardiac Emergency', location: 'Sector 12', eta: '8 min', priority: 'critical', route: 'Via Highway - Clear' },
          { id: 'a2', type: 'Accident Victim', location: 'MG Road Junction', eta: '12 min', priority: 'high', route: 'Via Main Road - Moderate Traffic' },
        ],
        trafficAlerts: [
          { id: 'ta1', type: 'accident', location: 'Western Express Highway', severity: 'high', message: 'Multi-vehicle accident blocking 2 lanes', affected: true, delay: 15 },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Healthcare Dashboard</h1>
          <p className="text-gray-500 font-medium">Staff ETA, ambulance priority & critical tracking</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Staff Arrived', value: `${data.hospitalArrival.arrived}/${data.hospitalArrival.totalStaff}`, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Critical Coverage', value: data.hospitalArrival.criticalCoverage, icon: Heart, color: 'bg-red-50 text-red-600' },
          { label: 'ER Wait Time', value: `${data.hospitalArrival.erWaitTime} min`, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Active Ambulances', value: data.ambulancePriority.length, icon: Ambulance, color: 'bg-blue-50 text-blue-600' },
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
          {/* Emergency Staff */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-5">Emergency Staff Tracking</h3>
            <div className="space-y-3">
              {data.emergencyStaff?.map((staff: any) => (
                <div key={staff.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${staff.status === 'arrived' ? 'bg-emerald-50 border border-emerald-200' : staff.status === 'delayed' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <Stethoscope size={16} className={staff.status === 'arrived' ? 'text-emerald-600' : staff.status === 'delayed' ? 'text-red-600' : 'text-blue-600'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{staff.name}</p>
                    <p className="text-xs text-gray-500">{staff.role} · {staff.location}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {staff.eta && <p className={`text-sm font-bold ${staff.status === 'delayed' ? 'text-red-600' : 'text-blue-600'}`}>ETA: {staff.eta}</p>}
                    {staff.status === 'arrived' && <p className="text-sm font-bold text-emerald-600">At Hospital</p>}
                    {staff.delay > 0 && <p className="text-xs text-amber-600">+{staff.delay} min delay</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Traffic Alerts */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-5">Traffic Alerts</h3>
            <div className="space-y-3">
              {data.trafficAlerts?.map((alert: any) => (
                <div key={alert.id} className={`p-4 rounded-xl border ${alert.affected ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className={alert.affected ? 'text-red-600' : 'text-amber-600'} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{alert.location}</p>
                      <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                      <p className={`text-xs font-bold mt-1 ${alert.affected ? 'text-red-600' : 'text-amber-600'}`}>+{alert.delay} min delay</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Ambulance Priority */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Ambulance Priority</h3>
            <div className="space-y-3">
              {data.ambulancePriority?.map((amb: any) => (
                <div key={amb.id} className={`p-4 rounded-xl border ${amb.priority === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Ambulance size={14} className={amb.priority === 'critical' ? 'text-red-600' : 'text-amber-600'} />
                    <span className="text-sm font-bold text-gray-900">{amb.type}</span>
                    <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${amb.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {amb.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{amb.location} → Hospital</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-gray-900">ETA: {amb.eta}</span>
                    <span className="text-[10px] text-gray-500">{amb.route}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hospital Summary */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Hospital Summary</h3>
            <div className="space-y-2">
              {[
                { label: 'Total Staff', value: data.hospitalArrival.totalStaff },
                { label: 'Arrived', value: data.hospitalArrival.arrived },
                { label: 'On Way', value: data.hospitalArrival.onWay },
                { label: 'Delayed', value: data.hospitalArrival.delayed },
                { label: 'On Leave', value: data.hospitalArrival.onLeave },
                { label: 'Shift Start', value: data.hospitalArrival.shiftStart },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthcareDashboardScreen;
