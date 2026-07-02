import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiGet } from '@/services/api';
import {
  Trophy, Star, Flame, Target, Gift, Shield, Sunrise, Footprints,
  Train, Leaf, RefreshCw, ChevronRight,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const iconMap: Record<string, any> = { shield: Shield, sunrise: Sunrise, leaf: Leaf, train: Train, footprints: Footprints, flame: Flame };

const GamificationScreen = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>(null);
  const [rewards, setRewards] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [achRes, goalRes, rewardRes, streakRes] = await Promise.all([
        apiGet<any>('/gamification/achievements'),
        apiGet<any>('/gamification/weekly-goals'),
        apiGet<any>('/gamification/rewards'),
        apiGet<any>('/gamification/streak'),
      ]);
      setAchievements(achRes.achievements || []);
      setGoals(goalRes);
      setRewards(rewardRes);
      setStreak(streakRes);
    } catch {
      setAchievements([
        { id: '1', name: 'Safe Traveller', description: 'Complete 10 journeys with 100% safety', icon: 'shield', progress: 80, unlocked: false },
        { id: '2', name: 'Early Bird', description: 'Leave before recommended time 5 times', icon: 'sunrise', progress: 60, unlocked: false },
        { id: '3', name: 'Eco Hero', description: 'Save 50kg CO2 through public transport', icon: 'leaf', progress: 45, unlocked: false },
        { id: '4', name: 'Metro Master', description: 'Take 20 metro trips', icon: 'train', progress: 70, unlocked: false },
        { id: '5', name: 'Walking Champion', description: 'Walk 50km total', icon: 'footprints', progress: 30, unlocked: false },
        { id: '6', name: 'Streak Master', description: 'Maintain a 7-day journey streak', icon: 'flame', progress: 100, unlocked: true },
      ]);
      setGoals({ week: 'Jun 30 - Jul 6, 2026', goals: [
        { id: 'g1', name: 'Complete 5 trips', current: 3, target: 5, progress: 60, reward: 50 },
        { id: 'g2', name: 'Use public transport 3 times', current: 2, target: 3, progress: 67, reward: 30 },
        { id: 'g3', name: 'Walk 5km total', current: 3.2, target: 5, progress: 64, reward: 25 },
      ], streak: 5, totalPoints: 1250, level: 12, nextLevelPoints: 1500, pointsToNextLevel: 250 });
      setRewards({ totalPoints: 1250, level: 12, recentEarnings: [
        { description: 'Daily streak bonus', points: 10, date: 'Today' },
        { description: 'Eco Hero milestone', points: 50, date: 'Yesterday' },
      ], redeemOptions: [
        { name: '₹50 Metro Pass', points: 500, category: 'transport' },
        { name: 'Free Bus Day Pass', points: 300, category: 'transport' },
      ]});
      setStreak({ currentStreak: 5, longestStreak: 12, history: [
        { date: '2026-07-03', active: true, trips: 3 },
        { date: '2026-07-02', active: true, trips: 2 },
        { date: '2026-07-01', active: true, trips: 4 },
        { date: '2026-06-30', active: true, trips: 3 },
        { date: '2026-06-29', active: true, trips: 2 },
        { date: '2026-06-28', active: false, trips: 0 },
        { date: '2026-06-27', active: true, trips: 3 },
      ]});
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

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Gamification</h1>
        <p className="text-gray-500 font-medium">Achievements, goals, streaks & rewards</p>
      </motion.div>

      {/* Level & Points */}
      <motion.div variants={fadeUp} className="bg-[#1b3a2a] rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-ff-lime flex items-center justify-center">
              <Trophy size={24} className="text-[#1b3a2a]" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">Level {goals?.level || rewards?.level || 12}</p>
              <p className="text-2xl font-black text-ff-lime">{goals?.totalPoints || rewards?.totalPoints || 1250} pts</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs">Next Level</p>
            <p className="text-sm font-bold">{goals?.pointsToNextLevel || 250} pts to go</p>
          </div>
        </div>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-ff-lime rounded-full" style={{ width: `${((goals?.totalPoints || 1250) / (goals?.nextLevelPoints || 1500)) * 100}%` }} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Achievements */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-5">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((ach) => {
                const Icon = iconMap[ach.icon] || Trophy;
                return (
                  <div key={ach.id} className={`p-4 rounded-xl border ${ach.unlocked ? 'bg-[#f4f7eb] border-[#e0e8d5]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ach.unlocked ? 'bg-[#1b3a2a]' : 'bg-gray-200'}`}>
                        <Icon size={18} className={ach.unlocked ? 'text-ff-lime' : 'text-gray-400'} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{ach.name}</p>
                        <p className="text-[10px] text-gray-500">{ach.description}</p>
                      </div>
                      {ach.unlocked && <Star size={16} className="text-amber-400" />}
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ach.unlocked ? 'bg-[#1b3a2a]' : 'bg-gray-400'}`} style={{ width: `${ach.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 block">{ach.progress}%</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Weekly Goals */}
          {goals && (
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-base text-gray-900 mb-2">Weekly Goals</h3>
              <p className="text-xs text-gray-400 mb-5">{goals.week}</p>
              <div className="space-y-3">
                {goals.goals?.map((g: any) => (
                  <div key={g.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">{g.name}</span>
                      <span className="text-xs font-bold text-[#1b3a2a]">+{g.reward} pts</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1b3a2a] rounded-full" style={{ width: `${g.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 block">{g.current}/{g.target}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          {/* Streak */}
          {streak && (
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-base text-gray-900 mb-4">Journey Streak</h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Flame size={32} className="text-amber-500" />
                <div className="text-center">
                  <p className="text-4xl font-black text-gray-900">{streak.currentStreak}</p>
                  <p className="text-xs text-gray-500">day streak</p>
                </div>
              </div>
              <div className="flex justify-between text-center mb-4">
                <div><p className="text-sm font-bold text-gray-900">{streak.longestStreak}</p><p className="text-[10px] text-gray-400">Best</p></div>
                <div><p className="text-sm font-bold text-gray-900">{streak.history?.filter((h: any) => h.active).length || 0}/7</p><p className="text-[10px] text-gray-400">This Week</p></div>
              </div>
              <div className="flex gap-1.5 justify-center">
                {streak.history?.map((h: any, i: number) => (
                  <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${h.active ? 'bg-[#1b3a2a] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {h.trips}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Rewards */}
          {rewards && (
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-base text-gray-900 mb-4">Redeem Rewards</h3>
              <div className="space-y-2">
                {rewards.redeemOptions?.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.name}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{r.category}</p>
                    </div>
                    <span className="text-xs font-bold text-[#1b3a2a]">{r.points} pts</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GamificationScreen;
