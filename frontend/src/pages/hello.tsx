// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { 
//   Sparkles, ArrowRight, Play, Train, Bus, MapPin, 
//   Shield, Zap, AlertTriangle, TrendingUp, SlidersHorizontal, Map, Leaf,
//   RefreshCw, Star, Github, Linkedin, Twitter, Menu
// } from "lucide-react";
// import { ContainerScroll } from "@/components/ui/container-scroll-animation";

// const fadeUp = {
//   hidden: { opacity: 0, y: 15 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
// };
// const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

// export default function Landing() {
//   return (
//     <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-[#1b3a2a] selection:text-white pb-0">
//       {/* Navigation */}
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16 transition-all duration-300">
//         <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-[#1b3a2a] flex items-center justify-center">
//               <RefreshCw size={18} strokeWidth={2.5} className="text-white" />
//             </div>
//             <span className="text-xl font-bold text-gray-900 tracking-tight">PRAVAAS</span>
//           </div>

//           <div className="hidden md:flex items-center gap-8">
//             {["Features", "How It Works", "Pricing", "About"].map(link => (
//               <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
//                 {link}
//               </a>
//             ))}
//           </div>

//           <div className="hidden md:flex items-center gap-4">
//             <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900">Log In</Link>
//             <Link to="/signup">
//               <button className="bg-[#1b3a2a] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-shadow">
//                 Get Started
//               </button>
//             </Link>
//           </div>

//           <button className="md:hidden text-gray-900">
//             <Menu size={24} />
//           </button>
//         </div>
//       </nav>

//       <main className="pt-16">
//         {/* Section 1 - Hero */}
//         <section className="relative overflow-hidden">
//           <ContainerScroll
//             titleComponent={
//               <div className="flex flex-col items-center gap-4 mb-4">
//                 <div className="bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full flex items-center gap-2">
//                   <Sparkles size={14} className="text-emerald-600" />
//                   <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">Smart Urban Transit</span>
//                 </div>
//                 <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
//                   Your Route.<br /><span className="text-[#1b3a2a]">Defended.</span>
//                 </h1>
//                 <p className="text-lg md:text-xl text-gray-500 font-medium max-w-[600px] leading-relaxed mx-auto text-center mt-4">
//                   The only transit platform that doesn't just plan your route — it actively defends it against real-world chaos.
//                 </p>
//                 <div className="flex items-center justify-center gap-3 mt-6">
//                   <Link to="/signup">
//                     <button className="bg-[#1b3a2a] text-white px-8 py-4 rounded-2xl font-bold text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all group">
//                       Get Started Free
//                       <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
//                     </button>
//                   </Link>
//                   {/* <button className="bg-white text-gray-700 px-6 py-4 rounded-2xl font-bold text-base border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors">
//                     <Play size={18} /> Watch Demo
//                   </button> */}
//                 </div>
//               </div>
//             }
//           >
//             {/* Fake Dashboard Screenshot inside card */}
//             <div className="p-6 bg-[#FAFAFA] rounded-2xl scale-[0.85] origin-top md:scale-100 flex flex-col gap-6 font-sans">
//               <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
//                 <div>
//                   <h3 className="font-bold text-xl text-gray-900">Good Morning, Rohan</h3>
//                   <p className="text-sm text-gray-500 font-medium">Ready for your commute?</p>
//                 </div>
//                 <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100">
//                   <Sparkles size={16} /> 28°C Mumbai
//                 </div>
//               </div>

//               <div className="bg-[#1b3a2a] rounded-[28px] p-8 text-white relative overflow-hidden shadow-lg">
//                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"/>
//                  <div className="relative z-10">
//                    <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center">
//                      BEST MATCH
//                    </div>
//                    <div className="mt-6 flex items-end justify-between">
//                      <div>
//                        <p className="text-3xl font-bold tracking-tight">Andheri → BKC</p>
//                        <p className="text-white/60 font-medium mt-1">Leave in 5 mins • Metro Line 1</p>
//                      </div>
//                      <div className="text-right">
//                        <span className="text-4xl font-bold tracking-tight">28 <span className="text-xl">min</span></span>
//                      </div>
//                    </div>
//                  </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm">
//                   <p className="text-3xl font-bold text-emerald-600">87%</p>
//                   <p className="text-sm font-medium text-gray-400 mt-1">Confidence Score</p>
//                 </div>
//                 <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm">
//                   <p className="text-3xl font-bold text-blue-600">₹30</p>
//                   <p className="text-sm font-medium text-gray-400 mt-1">Est. Cost</p>
//                 </div>
//               </div>
//             </div>
//           </ContainerScroll>
//         </section>

//         {/* Section 2 - Trusted By */}
//         <section className="bg-gray-50 py-12 border-y border-gray-100 w-full overflow-hidden">
//           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-8">Trusted by commuters across Mumbai</p>
//           <div className="flex items-center justify-center gap-12 md:gap-24 flex-wrap px-6">
//             <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all font-bold text-gray-700 text-lg"><Train/> Mumbai Metro</div>
//             <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all font-bold text-gray-700 text-lg"><Bus/> BEST Bus</div>
//             <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all font-bold text-gray-700 text-lg"><MapPin/> Google Maps</div>
//             <div className="hidden md:flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all font-bold text-gray-700 text-lg"><Shield/> CityGuard</div>
//             <div className="hidden md:flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all font-bold text-gray-700 text-lg"><Zap/> TransitIQ</div>
//           </div>
//         </section>

//         {/* Section 3 - Features */}
//         <section id="features" className="max-w-[1200px] mx-auto py-24 px-6">
//           <div className="text-center mb-16">
//             <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200">
//               Features
//             </div>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Everything you need for a smarter commute</h2>
//             <p className="text-lg text-gray-500 max-w-[500px] mx-auto mt-4 font-medium">Plan, adapt, and arrive on time — every single day.</p>
//           </div>

//           <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
//               <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-5"><RefreshCw className="text-blue-600" strokeWidth={2.5} size={22}/></div>
//               <h3 className="font-bold text-lg text-gray-900">Multi-Modal Planning</h3>
//               <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">Plan routes across metro, bus, auto, and walking — all in one search.</p>
//             </motion.div>

//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
//               <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-5"><AlertTriangle className="text-red-600" strokeWidth={2.5} size={22}/></div>
//               <h3 className="font-bold text-lg text-gray-900">Live Disruption Alerts</h3>
//               <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">Get instant notifications when delays or cancellations hit your route.</p>
//             </motion.div>

//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
//               <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5"><TrendingUp className="text-emerald-600" strokeWidth={2.5} size={22}/></div>
//               <h3 className="font-bold text-lg text-gray-900">Smart Rerouting</h3>
//               <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">Automatically find the best alternative when things go wrong.</p>
//             </motion.div>

//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
//               <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5"><SlidersHorizontal className="text-amber-600" strokeWidth={2.5} size={22}/></div>
//               <h3 className="font-bold text-lg text-gray-900">Preference Engine</h3>
//               <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">Prioritize speed, cost, or comfort — routes adapt to you.</p>
//             </motion.div>

//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
//               <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center mb-5"><Map className="text-purple-600" strokeWidth={2.5} size={22}/></div>
//               <h3 className="font-bold text-lg text-gray-900">Live Traffic Heatmap</h3>
//               <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">See congestion zones, crowd levels, and disruptions on a real-time map.</p>
//             </motion.div>

//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
//               <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5"><Leaf className="text-emerald-600" strokeWidth={2.5} size={22}/></div>
//               <h3 className="font-bold text-lg text-gray-900">Carbon Tracking</h3>
//               <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">Track your environmental impact vs. driving every trip.</p>
//             </motion.div>
//           </motion.div>
//         </section>

//         {/* Section 4 - How It Works */}
//         <section id="how-it-works" className="max-w-[1240px] mx-auto mb-20 px-4 md:px-0">
//           <div className="bg-[#1b3a2a] rounded-[40px] py-20 px-8 text-white relative overflow-hidden">
//             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.07] to-transparent pointer-events-none" />
//             <div className="text-center relative z-10 mb-16">
//               <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">How PRAVAAS Works</h2>
//               <p className="text-lg text-white/60 mt-4 max-w-[500px] mx-auto font-medium">From search to arrival, we've got you covered.</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 max-w-5xl mx-auto">
//               <div className="hidden md:block absolute top-[52px] left-[16%] right-[16%] h-[2px] border-t-2 border-dashed border-white/20 z-[-1]"/>

//               <div className="flex flex-col items-center text-center">
//                 <div className="text-6xl font-black text-white/10 mb-[-20px] select-none">01</div>
//                 <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl">
//                   <MapPin className="text-white" size={24} strokeWidth={2.5} />
//                 </div>
//                 <h3 className="font-bold text-xl text-white mb-3">Search Your Route</h3>
//                 <p className="text-sm text-white/60 leading-relaxed font-medium">Enter origin and destination. Set your preferences for speed, cost, or comfort.</p>
//               </div>

//               <div className="flex flex-col items-center text-center">
//                 <div className="text-6xl font-black text-white/10 mb-[-20px] select-none">02</div>
//                 <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl">
//                   <Shield className="text-white" size={24} strokeWidth={2.5} />
//                 </div>
//                 <h3 className="font-bold text-xl text-white mb-3">Travel with Confidence</h3>
//                 <p className="text-sm text-white/60 leading-relaxed font-medium">Get real-time updates and a confidence score for your route as you travel.</p>
//               </div>

//               <div className="flex flex-col items-center text-center">
//                 <div className="text-6xl font-black text-white/10 mb-[-20px] select-none">03</div>
//                 <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl">
//                   <RefreshCw className="text-white" size={24} strokeWidth={2.5} />
//                 </div>
//                 <h3 className="font-bold text-xl text-white mb-3">Adapt Instantly</h3>
//                 <p className="text-sm text-white/60 leading-relaxed font-medium">If disruptions hit, PRAVAAS reroutes you automatically before you even notice.</p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Section 5 - Stats */}
//         <section className="max-w-[1200px] mx-auto py-16 px-6">
//           <div className="flex flex-col lg:flex-row gap-16 items-center">
//             <div className="flex-1">
//               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-6">Built for Mumbai's real chaos</h2>
//               <p className="text-lg text-gray-500 font-medium mb-10 max-w-lg leading-relaxed">
//                 We know that perfect routes don't exist in reality. PRAVAAS is built to anticipate, monitor, and adapt to the unpredictable nature of urban transit.
//               </p>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
//                   <p className="text-3xl font-bold text-emerald-600 mb-1">87%</p>
//                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Route Accuracy</p>
//                 </div>
//                 <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
//                   <p className="text-3xl font-bold text-blue-600 mb-1">12<span className="text-xl">m</span></p>
//                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Time Saved</p>
//                 </div>
//                 <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
//                   <p className="text-3xl font-bold text-amber-500 mb-1">2.4<span className="text-xl">kg</span></p>
//                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">CO₂ Saved</p>
//                 </div>
//               </div>
//             </div>
//             <div className="flex-1 w-full max-w-[360px] mx-auto">
//               <div className="bg-gray-900 rounded-[40px] p-3 shadow-2xl relative border-4 border-gray-800">
//                 <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[80px] h-[20px] bg-black rounded-b-xl z-20" />
//                 <div className="bg-[#FAFAFA] rounded-[28px] overflow-hidden min-h-[640px] flex flex-col pt-10">
//                   <div className="px-6 flex-1">
//                       <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 mb-4">
//                         <div className="flex gap-3 mb-2 items-center">
//                           <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
//                             <MapPin size={14} className="text-blue-500" />
//                           </div>
//                           <div className="h-8 bg-gray-50 rounded-xl flex-1 border border-gray-200" />
//                         </div>
//                         <div className="flex gap-3 items-center">
//                           <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
//                             <MapPin size={14} className="text-red-500" />
//                           </div>
//                           <div className="h-8 bg-gray-50 rounded-xl flex-1 border border-gray-200" />
//                         </div>
//                       </div>
//                       <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 mb-4 h-[120px]" />
//                       <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 h-[180px]" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Section 6 - Testimonials */}
//         <section className="bg-gray-50 py-24 w-full">
//           <div className="max-w-[1200px] mx-auto px-6">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight text-center mb-16">Loved by thousands</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100">
//                 <div className="flex gap-1 mb-5">
//                   {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" className="text-amber-400" />)}
//                 </div>
//                 <p className="text-sm font-medium text-gray-700 leading-relaxed italic mb-8">
//                   "PRAVAAS saved me 20 minutes during the metro strike last week. It rerouted me to a bus before I even knew there was a problem."
//                 </p>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">PM</div>
//                   <div>
//                     <p className="text-sm font-bold text-gray-900">Priya M.</p>
//                     <p className="text-xs font-medium text-gray-400">Commuter, Mumbai</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100">
//                 <div className="flex gap-1 mb-5">
//                   {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" className="text-amber-400" />)}
//                 </div>
//                 <p className="text-sm font-medium text-gray-700 leading-relaxed italic mb-8">
//                   "The preference sliders are genius. I set it to cheapest and now I save ₹200 a week on my commute without thinking about it."
//                 </p>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">AK</div>
//                   <div>
//                     <p className="text-sm font-bold text-gray-900">Arjun K.</p>
//                     <p className="text-xs font-medium text-gray-400">Commuter, Mumbai</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100">
//                 <div className="flex gap-1 mb-5">
//                   {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" className="text-amber-400" />)}
//                 </div>
//                 <p className="text-sm font-medium text-gray-700 leading-relaxed italic mb-8">
//                   "Finally an app that understands Mumbai traffic dynamically. The heatmap layer alone is completely worth using this daily."
//                 </p>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">SR</div>
//                   <div>
//                     <p className="text-sm font-bold text-gray-900">Sneha R.</p>
//                     <p className="text-xs font-medium text-gray-400">Commuter, Mumbai</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Section 7 - CTA */}
//         <section className="max-w-[800px] mx-auto py-24 px-6 text-center">
//           <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Ready to defend your commute?</h2>
//           <p className="text-lg text-gray-500 font-medium mb-10 max-w-[500px] mx-auto">Join thousands of Mumbai commuters who never get stuck again.</p>
//           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//             <Link to="/signup">
//               <button className="bg-[#1b3a2a] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto">
//                 Create Free Account
//               </button>
//             </Link>
//             <a href="#features">
//               <button className="bg-gray-100 text-gray-600 border border-transparent hover:border-gray-200 px-8 py-4 rounded-2xl font-bold text-base hover:bg-gray-200 transition-colors w-full sm:w-auto">
//                 Explore Features
//               </button>
//             </a>
//           </div>
//           <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-6">No credit card required · Free forever</p>
//         </section>
//       </main>

//       <footer className="bg-white border-t border-gray-100 py-12 w-full mt-12">
//         <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
//           <div>
//             <div className="flex items-center gap-2 mb-4">
//                <div className="w-8 h-8 rounded-lg bg-[#1b3a2a] flex items-center justify-center">
//                  <RefreshCw size={16} strokeWidth={2.5} className="text-white" />
//                </div>
//                <span className="text-lg font-bold text-gray-900">PRAVAAS</span>
//             </div>
//             <p className="text-sm text-gray-500 font-medium mb-6">Smart urban transit for everyone.</p>
//             <div className="flex items-center gap-4 text-gray-400">
//               <Twitter size={20} className="hover:text-gray-900 cursor-pointer" />
//               <Github size={20} className="hover:text-gray-900 cursor-pointer" />
//               <Linkedin size={20} className="hover:text-gray-900 cursor-pointer" />
//             </div>
//           </div>
//           <div>
//             <h4 className="font-bold text-gray-900 mb-4">Product</h4>
//             <ul className="space-y-3 text-sm text-gray-500 font-medium">
//               <li><a className="hover:text-gray-900 transition-colors" href="#">Features</a></li>
//               <li><a className="hover:text-gray-900 transition-colors" href="#">Pricing</a></li>
//               <li><a className="hover:text-gray-900 transition-colors" href="#">API</a></li>
//               <li><a className="hover:text-gray-900 transition-colors" href="#">Changelog</a></li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="font-bold text-gray-900 mb-4">Company</h4>
//             <ul className="space-y-3 text-sm text-gray-500 font-medium">
//               <li><a className="hover:text-gray-900 transition-colors" href="#">About</a></li>
//               <li><a className="hover:text-gray-900 transition-colors" href="#">Blog</a></li>
//               <li><a className="hover:text-gray-900 transition-colors" href="#">Careers</a></li>
//               <li><a className="hover:text-gray-900 transition-colors" href="#">Contact</a></li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
//             <ul className="space-y-3 text-sm text-gray-500 font-medium">
//               <li><a className="hover:text-gray-900 transition-colors" href="#">Privacy</a></li>
//               <li><a className="hover:text-gray-900 transition-colors" href="#">Terms</a></li>
//               <li><a className="hover:text-gray-900 transition-colors" href="#">Cookie Policy</a></li>
//             </ul>
//           </div>
//         </div>
//         <div className="max-w-[1200px] mx-auto px-6 mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
//             <p className="text-xs text-gray-400 font-medium">© 2026 PRAVAAS · Made in Mumbai 🇮🇳</p>
//         </div>
//       </footer>
//     </div>
//   );
// }
