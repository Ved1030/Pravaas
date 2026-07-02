import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiGet } from '@/services/api';
import {
  Package, MapPin, TrendingUp, Fuel, Clock, RefreshCw,
  IndianRupee, Navigation, AlertTriangle, ChevronRight, BarChart3, Star,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const DeliveryDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGet<any>('/delivery/dashboard');
      setData(res);
    } catch {
      setData({
        orders: [
          { id: 'o1', customer: 'Rahul M.', items: 3, pickup: 'MG Road Restaurant', drop: 'Sector 14, Apt 5B', distance: 4.2, payment: 85, status: 'pending', priority: 'normal' },
          { id: 'o2', customer: 'Priya K.', items: 1, pickup: 'Central Mall', drop: 'Sunrise Apartments', distance: 2.8, payment: 65, status: 'assigned', priority: 'express' },
          { id: 'o3', customer: 'Amit S.', items: 5, pickup: 'Green Valley Market', drop: 'Hill View Colony', distance: 6.1, payment: 120, status: 'pending', priority: 'normal' },
        ],
        traffic: { level: 'medium', congestedAreas: ['MG Road', 'Sector 5 Circle'], estimatedDelay: 8, bestTimeToTravel: 'Before 11:00 AM or after 2:00 PM' },
        incomePrediction: { today: 580, thisWeek: 3850, thisMonth: 15200, avgPerOrder: 78, tips: 320, bonus: 150 },
        fuelEstimate: { currentPrice: 102.50, dailyEstimate: 180, weeklyEstimate: 1100, efficiency: '32 km/l', totalDistanceToday: 28.5 },
        bestZones: [
          { name: 'MG Road', orders: 12, avgPayment: 95, distance: 2.1 },
          { name: 'Central Mall', orders: 8, avgPayment: 70, distance: 1.5 },
          { name: 'Sector 14', orders: 6, avgPayment: 85, distance: 3.2 },
        ],
        peakHours: [
          { hour: '12:00 - 13:00', demand: 'high', surge: 1.5 },
          { hour: '19:00 - 20:00', demand: 'high', surge: 1.8 },
          { hour: '10:00 - 11:00', demand: 'medium', surge: 1.0 },
        ],
        analytics: { totalDeliveries: 245, avgDeliveryTime: 22, onTimeRate: 94, customerRating: 4.7, totalEarnings: 18500 },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Delivery Dashboard</h1>
          <p className="text-gray-500 font-medium">Orders, traffic, income & route optimization</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Earnings", value: `₹${data.incomePrediction.today}`, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Orders Today', value: data.analytics.totalDeliveries, icon: Package, color: 'bg-[#f4f7eb] text-[#1b3a2a]' },
          { label: 'Avg Delivery', value: `${data.analytics.avgDeliveryTime} min`, icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Rating', value: data.analytics.customerRating, icon: Star, color: 'bg-amber-50 text-amber-600' },
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
          {/* Active Orders */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-5">Active Orders</h3>
            <div className="space-y-3">
              {data.orders?.map((order: any) => (
                <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${order.priority === 'express' ? 'bg-amber-100 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <Package size={16} className={order.priority === 'express' ? 'text-amber-600' : 'text-blue-600'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900">{order.customer}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${order.status === 'assigned' ? 'bg-blue-100 text-blue-700' : order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.status}
                      </span>
                      {order.priority === 'express' && (
                        <span className="text-[10px] font-bold text-amber-600">EXPRESS</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{order.pickup} → {order.drop}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{order.distance} km</span>
                      <span className="text-xs text-gray-500">{order.items} items</span>
                      <span className="text-xs font-bold text-gray-900">₹{order.payment}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fuel & Traffic */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-base text-gray-900 mb-4">Fuel Estimate</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Fuel Price</span>
                  <span className="text-sm font-bold">₹{data.fuelEstimate.currentPrice}/L</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Daily Estimate</span>
                  <span className="text-sm font-bold">₹{data.fuelEstimate.dailyEstimate}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Efficiency</span>
                  <span className="text-sm font-bold">{data.fuelEstimate.efficiency}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Distance Today</span>
                  <span className="text-sm font-bold">{data.fuelEstimate.totalDistanceToday} km</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-base text-gray-900 mb-4">Traffic Status</h3>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-600 font-bold uppercase">Level: {data.traffic.level}</p>
                  <p className="text-xs text-amber-700 mt-1">Est. delay: {data.traffic.estimatedDelay} min</p>
                </div>
                <p className="text-xs text-gray-500">Best time: {data.traffic.bestTimeToTravel}</p>
                <div className="space-y-1">
                  {data.traffic.congestedAreas?.map((area: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <AlertTriangle size={12} className="text-amber-500" /> {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Best Zones */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Best Zones</h3>
            <div className="space-y-3">
              {data.bestZones?.map((zone: any, i: number) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900">{zone.name}</span>
                    <span className="text-xs font-bold text-emerald-600">₹{zone.avgPayment}/order</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{zone.orders} orders</span>
                    <span className="text-xs text-gray-500">{zone.distance} km avg</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Peak Hours */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-base text-gray-900 mb-4">Peak Hours</h3>
            <div className="space-y-3">
              {data.peakHours?.map((ph: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-semibold text-gray-700">{ph.hour}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${ph.demand === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {ph.demand}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{ph.surge}x</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monthly Summary */}
          <motion.div variants={fadeUp} className="bg-[#1b3a2a] rounded-2xl p-5 text-white">
            <h3 className="font-semibold text-base text-white/90 mb-3">Monthly Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-white/70">Earnings</span>
                <span className="text-sm font-bold text-ff-lime">₹{data.incomePrediction.thisMonth?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white/70">Tips</span>
                <span className="text-sm font-bold">₹{data.incomePrediction.tips}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white/70">On-time Rate</span>
                <span className="text-sm font-bold">{data.analytics.onTimeRate}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DeliveryDashboardScreen;
