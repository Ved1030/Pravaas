
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles, ArrowRight, Play, Train, Bus, MapPin,
  Shield, Zap, AlertTriangle, TrendingUp, SlidersHorizontal,
  Map, Leaf, RefreshCw, Star, Github, Linkedin, Twitter,
  Menu, Users, Clock, Navigation, ChevronRight, Heart,
  Award, Target, Globe, X, Activity, Route
} from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { useState, useEffect } from "react";

const LIME = "#C5F02C";
const DARK_GREEN = "#1b3a2a";
const WARM_BG = "#f9f8f2";
const WARM_GREEN_BG = "#f4f7eb";
const TEAL = "#3c7689";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

function useCounter(target: number, duration = 1.8) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);

  const start = () => {
    if (started) return;
    setStarted(true);
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target * 10) / 10);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return { val, start };
}

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const accuracy = useCounter(87);
  const timeSaved = useCounter(12);
  const co2Saved = useCounter(2.4);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ═══════ NAVIGATION ═══════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm"
          : "bg-white/60 backdrop-blur-md border-b border-transparent"
          }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-15 h-15 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100">
              <img
                src="/logo3.png"
                alt="FlowCity Logo"
                className="w-10 h-10 object-contain rounded-2xl"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              FlowCity
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Log In
              </motion.button>
            </Link>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: DARK_GREEN }}
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="text-left text-lg font-bold text-gray-900 py-3 border-b border-gray-100 transition-colors"
                  style={{ "--hover-color": DARK_GREEN } as React.CSSProperties}
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-6 flex flex-col gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-3.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-700">
                    Log In
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className="w-full py-3.5 rounded-2xl text-sm font-bold shadow-md"
                    style={{ backgroundColor: DARK_GREEN, color: "white" }}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-16">

        {/* ═══════ SECTION 1 — HERO ═══════ */}
        {/* ═══════ SECTION 1 — HERO (Dark Theme) ═══════ */}
        {/* ═══════ SECTION 1 — HERO (Dark Green Theme) ═══════ */}
        <section className="relative overflow-hidden" style={{ backgroundColor: DARK_GREEN }}>
          {/* ── Background ambient effects ── */}
          {/* Large lime glow — top center */}
          <div
            className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full pointer-events-none opacity-[0.12]"
            style={{
              background: `radial-gradient(ellipse, ${LIME}, transparent 70%)`,
            }}
          />
          {/* Secondary glow — bottom right */}
          <div
            className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.06]"
            style={{
              background: `radial-gradient(circle, ${LIME}, transparent 70%)`,
            }}
          />
          {/* Top-left decorative glow */}
          <div
            className="absolute top-[10%] left-[-150px] w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.05]"
            style={{
              background: `radial-gradient(circle, #ffffff, transparent 70%)`,
            }}
          />
          {/* Radial overlay from top — same as How It Works */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at top, rgba(255,255,255,0.07), transparent 60%)",
            }}
          />
          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <ContainerScroll
            titleComponent={
              <div className="flex flex-col items-center gap-4 mb-4 relative z-10">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="px-4 py-1.5 rounded-full flex items-center gap-2"
                  style={{
                    backgroundColor: `${LIME}15`,
                    border: `1px solid ${LIME}25`,
                  }}
                >
                  <Sparkles size={14} style={{ color: LIME }} />
                  <span
                    className="text-xs font-bold tracking-wider uppercase"
                    style={{ color: LIME }}
                  >
                    Smart Urban Transit
                  </span>
                </motion.div>

                {/* Main headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-white"
                >
                  Your Route.
                  <br />
                  <span style={{ color: LIME }}>Defended.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-lg md:text-xl font-medium max-w-[600px] leading-relaxed mx-auto text-center mt-4"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  The only transit platform that doesn't just plan your route —
                  it actively defends it against real-world chaos.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-center justify-center gap-3 mt-6"
                >
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-8 py-4 rounded-2xl font-bold text-base flex items-center gap-2 transition-all group"
                      style={{
                        backgroundColor: LIME,
                        color: DARK_GREEN,
                        boxShadow: `0 0 40px ${LIME}30, 0 4px 20px rgba(0,0,0,0.2)`,
                      }}
                    >
                      Get Started Free
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </motion.button>
                  </Link>

                </motion.div>

                {/* Trust indicators below CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex items-center gap-6 mt-8"
                >
                  {[
                    { icon: Shield, text: "Real-time protection" },
                    { icon: Users, text: "12K+ commuters" },
                    { icon: Zap, text: "Instant rerouting" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-1.5">
                      <item.icon
                        size={13}
                        strokeWidth={2.5}
                        style={{ color: `${LIME}90` }}
                      />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>
            }
          >
            {/* ── Dashboard Screenshot Image (UNTOUCHED) ── */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100">
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='30'%3E%3Crect fill='%23f4f7eb' width='40' height='30'/%3E%3Crect fill='%231b3a2a' x='2' y='8' width='36' height='12' rx='4'/%3E%3Crect fill='%23fff' x='2' y='2' width='36' height='5' rx='2'/%3E%3Crect fill='%23fff' x='2' y='22' width='17' height='6' rx='2'/%3E%3Crect fill='%23fff' x='21' y='22' width='17' height='6' rx='2'/%3E%3C/svg%3E")`,
                  backgroundSize: "cover",
                  filter: "blur(20px)",
                  transform: "scale(1.1)",
                }}
              />

              <img
                src="/image.png"
                alt="FlowCity Dashboard — Real-time transit planning with route confidence scores"
                width={1400}
                height={900}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="relative z-10 w-full h-full object-cover object-top rounded-2xl transition-opacity duration-500"
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "1";
                }}
                style={{ opacity: 0 }}
              />

              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/10 to-transparent z-20 rounded-b-2xl pointer-events-none" />
            </div>
          </ContainerScroll>

          {/* ── Bottom fade transition to next section ── */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-30"
            style={{
              background: `linear-gradient(to bottom, transparent, #FAFAFA)`,
            }}
          />
        </section>

        {/* ═══════ SECTION 2 — TRUSTED BY ═══════ */}
        <section
          className="py-12 border-y border-gray-100 w-full overflow-hidden"
          style={{ backgroundColor: WARM_BG }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] text-center mb-8">
            Trusted by commuters across Mumbai
          </p>
          <div className="flex items-center justify-center gap-10 md:gap-20 flex-wrap px-6">
            {[
              { icon: Train, label: "Mumbai Metro" },
              { icon: Bus, label: "BEST Bus" },
              { icon: MapPin, label: "Google Maps" },
              { icon: Shield, label: "CityGuard" },
              { icon: Zap, label: "TransitIQ" },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ opacity: 1, scale: 1.05 }}
                className="flex items-center gap-2 opacity-30 hover:opacity-80 transition-all cursor-default"
              >
                <item.icon size={20} className="text-gray-600" strokeWidth={2} />
                <span className="font-bold text-gray-600 text-sm">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════ SECTION 3 — FEATURES ═══════ */}
        <section id="features" className="max-w-[1200px] mx-auto py-24 px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-block mb-4">
              <span
                className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: WARM_GREEN_BG,
                  color: DARK_GREEN,
                  border: `1px solid ${LIME}30`,
                }}
              >
                Features
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
            >
              Everything you need for a smarter commute
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-500 max-w-[500px] mx-auto mt-4 font-medium"
            >
              Plan, adapt, and arrive on time — every single day.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Route,
                title: "Multi-Modal Planning",
                desc: "Plan routes across metro, bus, auto, and walking — all in one search.",
                iconBg: WARM_GREEN_BG,
                iconColor: DARK_GREEN,
                borderColor: `${LIME}40`,
              },
              {
                icon: AlertTriangle,
                title: "Live Disruption Alerts",
                desc: "Get instant notifications when delays or cancellations hit your route.",
                iconBg: "#fef2f2",
                iconColor: "#dc2626",
                borderColor: "#fecaca",
              },
              {
                icon: TrendingUp,
                title: "Smart Rerouting",
                desc: "Automatically find the best alternative when things go wrong.",
                iconBg: "#ecfdf5",
                iconColor: "#059669",
                borderColor: "#a7f3d0",
              },
              {
                icon: SlidersHorizontal,
                title: "Preference Engine",
                desc: "Prioritize speed, cost, or comfort — routes adapt to you.",
                iconBg: "#fffbeb",
                iconColor: "#d97706",
                borderColor: "#fde68a",
              },
              {
                icon: Map,
                title: "Live Traffic Heatmap",
                desc: "See congestion zones, crowd levels, and disruptions on a real-time map.",
                iconBg: "#faf5ff",
                iconColor: "#7c3aed",
                borderColor: "#ddd6fe",
              },
              {
                icon: Leaf,
                title: "Carbon Tracking",
                desc: "Track your environmental impact vs. driving every trip.",
                iconBg: WARM_GREEN_BG,
                iconColor: DARK_GREEN,
                borderColor: `${LIME}40`,
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.2 },
                }}
                className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100 cursor-default hover:shadow-md transition-shadow group"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: feature.iconBg,
                    border: `1px solid ${feature.borderColor}`,
                  }}
                >
                  <feature.icon
                    strokeWidth={2.5}
                    size={22}
                    style={{ color: feature.iconColor }}
                  />
                </div>
                <h3 className="font-bold text-lg text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ═══════ SECTION 4 — HOW IT WORKS ═══════ */}
        <section id="how-it-works" className="max-w-[1240px] mx-auto mb-20 px-4 md:px-0">
          <div className="bg-[#1b3a2a] rounded-[40px] py-20 px-8 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.07] to-transparent pointer-events-none" />
            <div className="text-center relative z-10 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">How FlowCity Works</h2>
              <p className="text-lg text-white/60 mt-4 max-w-[500px] mx-auto font-medium">From search to arrival, we've got you covered.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-[52px] left-[16%] right-[16%] h-[2px] border-t-2 border-dashed border-white/20 z-[-1]" />

              <div className="flex flex-col items-center text-center">
                <div className="text-6xl font-black text-white/10 mb-[-20px] select-none">01</div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl">
                  <MapPin className="text-white" size={24} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-xl text-white mb-3">Search Your Route</h3>
                <p className="text-sm text-white/60 leading-relaxed font-medium">Enter origin and destination. Set your preferences for speed, cost, or comfort.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="text-6xl font-black text-white/10 mb-[-20px] select-none">02</div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl">
                  <Shield className="text-white" size={24} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-xl text-white mb-3">Travel with Confidence</h3>
                <p className="text-sm text-white/60 leading-relaxed font-medium">Get real-time updates and a confidence score for your route as you travel.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="text-6xl font-black text-white/10 mb-[-20px] select-none">03</div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl">
                  <RefreshCw className="text-white" size={24} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-xl text-white mb-3">Adapt Instantly</h3>
                <p className="text-sm text-white/60 leading-relaxed font-medium">If disruptions hit, FlowCity reroutes you automatically before you even notice.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ SECTION 5 — ABOUT ═══════ */}
        <section id="about" className="max-w-[1200px] mx-auto py-24 px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left — Text + Stats */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="flex-1"
            >
              <motion.div variants={fadeUp} className="mb-4">
                <span
                  className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: WARM_GREEN_BG,
                    color: DARK_GREEN,
                    border: `1px solid ${LIME}30`,
                  }}
                >
                  About FlowCity
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-6"
              >
                Built for Mumbai's
                <br />
                <span style={{ color: DARK_GREEN }}>real chaos</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg text-gray-500 font-medium mb-6 max-w-lg leading-relaxed"
              >
                We know that perfect routes don't exist in reality. FlowCity is
                built to anticipate, monitor, and adapt to the unpredictable
                nature of urban transit.
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="text-sm text-gray-400 font-medium mb-10 max-w-lg leading-relaxed"
              >
                Born from the frustration of missed connections, surprise delays,
                and cancelled buses, FlowCity uses a proprietary disruption
                detection engine to give commuters something no other app offers:
                a route that fights for you.
              </motion.p>

              {/* Stats — matching dashboard style */}
              <motion.div
                variants={fadeUp}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <motion.div
                  whileInView={() => { accuracy.start(); return {}; }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                    <Target size={20} className="text-green-500" strokeWidth={2.5} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">
                    {accuracy.val}
                    <span className="text-lg text-gray-400">%</span>
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    Route Accuracy
                  </p>
                </motion.div>

                <motion.div
                  whileInView={() => { timeSaved.start(); return {}; }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: WARM_GREEN_BG }}
                  >
                    <Clock size={20} style={{ color: DARK_GREEN }} strokeWidth={2.5} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">
                    {timeSaved.val}
                    <span className="text-lg text-gray-400">m</span>
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    Avg Time Saved
                  </p>
                </motion.div>

                <motion.div
                  whileInView={() => { co2Saved.start(); return {}; }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: WARM_GREEN_BG }}
                  >
                    <Leaf size={20} style={{ color: DARK_GREEN }} strokeWidth={2.5} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">
                    {co2Saved.val}
                    <span className="text-lg text-gray-400">kg</span>
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    CO₂ Saved Daily
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right — Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 w-full max-w-[360px] mx-auto"
            >
              <div className="bg-gray-900 rounded-[40px] p-3 shadow-2xl relative border-4 border-gray-800">
                <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[80px] h-[20px] bg-black rounded-b-xl z-20" />

                <div
                  className="rounded-[28px] overflow-hidden min-h-[580px] flex flex-col pt-10"
                  style={{ backgroundColor: "#FAFAFA" }}
                >
                  <div className="px-5 flex-1 space-y-3 pb-6">
                    {/* Search Card */}
                    <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100">
                      <div className="flex gap-3 mb-2.5 items-center">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: WARM_GREEN_BG, border: `1px solid ${LIME}30` }}
                        >
                          <MapPin size={13} style={{ color: DARK_GREEN }} strokeWidth={2.5} />
                        </div>
                        <div className="h-8 bg-gray-50 rounded-xl flex-1 border border-gray-200 flex items-center px-3">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Andheri Station
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                          <MapPin size={13} className="text-red-500" strokeWidth={2.5} />
                        </div>
                        <div className="h-8 bg-gray-50 rounded-xl flex-1 border border-gray-200 flex items-center px-3">
                          <span className="text-[10px] text-gray-400 font-medium">
                            BKC, Mumbai
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preference Bars */}
                    <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 space-y-3">
                      {[
                        { label: "Speed", width: "70%", color: DARK_GREEN },
                        { label: "Cost", width: "50%", color: "#059669" },
                        { label: "Comfort", width: "30%", color: "#d97706" },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">
                              {s.label}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 tabular-nums">
                              {s.width.replace("%", "")}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div
                              className="h-full rounded-full"
                              style={{ width: s.width, backgroundColor: s.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Route Result Card */}
                    <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className="text-[9px] font-bold px-2 py-1 rounded-lg text-white"
                          style={{ backgroundColor: DARK_GREEN }}
                        >
                          FASTEST
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900 tabular-nums">
                            28
                          </span>
                          <span className="text-xs font-medium text-gray-400 ml-0.5">
                            min
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-1.5 mb-2">
                        <div className="bg-gray-300 rounded-full" style={{ width: "14%" }} />
                        <div className="rounded-full" style={{ width: "64%", backgroundColor: DARK_GREEN }} />
                        <div className="bg-gray-300 rounded-full" style={{ width: "22%" }} />
                      </div>
                      <div className="flex gap-2">
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: WARM_GREEN_BG,
                            color: DARK_GREEN,
                            border: `1px solid ${LIME}30`,
                          }}
                        >
                          87% Conf
                        </span>
                        <span className="bg-gray-50 text-gray-500 text-[8px] font-bold px-1.5 py-0.5 rounded border border-gray-200">
                          ₹30
                        </span>
                      </div>
                    </div>

                    {/* Disruption Alert Mini */}
                    <div className="bg-orange-50 rounded-[20px] p-3 border border-orange-200 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        <AlertTriangle size={12} className="text-orange-600" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-900">
                          Metro L1 Delayed
                        </p>
                        <p className="text-[9px] font-medium text-orange-600">8 min delay</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════ SECTION 6 — TESTIMONIALS ═══════ */}
        <section
          id="testimonials"
          className="py-24 w-full border-y border-gray-100"
          style={{ backgroundColor: WARM_BG }}
        >
          <div className="max-w-[1200px] mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.div variants={fadeUp} className="inline-block mb-4">
                <span
                  className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: WARM_GREEN_BG,
                    color: DARK_GREEN,
                    border: `1px solid ${LIME}30`,
                  }}
                >
                  Testimonials
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
              >
                Loved by thousands
              </motion.h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  quote:
                    "FlowCity saved me 20 minutes during the metro strike last week. It rerouted me to a bus before I even knew there was a problem.",
                  name: "Priya M.",
                  initials: "PM",
                  bg: WARM_GREEN_BG,
                  color: DARK_GREEN,
                },
                {
                  quote:
                    "The preference sliders are genius. I set it to cheapest and now I save ₹200 a week on my commute without thinking about it.",
                  name: "Arjun K.",
                  initials: "AK",
                  bg: "#ecfdf5",
                  color: "#059669",
                },
                {
                  quote:
                    "Finally an app that understands Mumbai traffic dynamically. The heatmap layer alone is completely worth using this every single day.",
                  name: "Sneha R.",
                  initials: "SR",
                  bg: "#faf5ff",
                  color: "#7c3aed",
                },
              ].map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-1 mb-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={16}
                        fill="currentColor"
                        className="text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed italic mb-8">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: t.bg, color: t.color }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs font-medium text-gray-400">
                        Commuter, Mumbai
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════ SECTION 7 — CTA ═══════ */}
        <section className="max-w-[800px] mx-auto py-24 px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span
                className="inline-block w-16 h-16 rounded-2xl mb-6 flex items-center justify-center mx-auto"
                style={{ backgroundColor: WARM_GREEN_BG, border: `1px solid ${LIME}30` }}
              >
                <Shield size={28} style={{ color: DARK_GREEN }} strokeWidth={2} />
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold text-gray-900 mb-6 tracking-tight"
            >
              Ready to defend your commute?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-500 font-medium mb-10 max-w-[500px] mx-auto"
            >
              Join thousands of Mumbai commuters who never get stuck again.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="text-white px-8 py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center gap-2 w-full sm:w-auto"
                  style={{ backgroundColor: DARK_GREEN }}
                >
                  Create Free Account
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollTo("#features")}
                className="px-8 py-4 rounded-2xl font-bold text-base transition-colors w-full sm:w-auto border"
                style={{
                  backgroundColor: WARM_BG,
                  borderColor: "#e5e5e5",
                  color: "#4b5563",
                }}
              >
                Explore Features
              </motion.button>
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="text-xs text-gray-400 font-medium tracking-wider mt-6"
            >
              No credit card required · Free forever
            </motion.p>
          </motion.div>
        </section>
      </main>

      {/* ═══════ FOOTER (Dark Green Theme) ═══════ */}
      <footer className="relative w-full overflow-hidden" style={{ backgroundColor: DARK_GREEN }}>
        {/* Ambient background effects */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none opacity-[0.06]" style={{ background: `radial-gradient(ellipse, ${LIME}, transparent 70%)` }} />
        <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.04]" style={{ background: `radial-gradient(circle, ${LIME}, transparent 70%)` }} />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 60%)" }} />

        <div className="relative z-20 pt-24 pb-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
              {/* Brand Column */}
              <div className="col-span-2">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-15 h-15 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100">
                    <img
                      src="/logo3.png"
                      alt="FlowCity Logo"
                      className="w-10 h-10 object-contain rounded-2xl"
                    />
                  </div>
                  <span className="text-xl font-bold text-white tracking-tight">FlowCity</span>
                </div>

                <p className="text-sm font-medium mb-6 max-w-[280px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  The smart urban transit platform that defends your route against real-world chaos. Built in Mumbai, for Mumbai.
                </p>

                <div className="flex items-center gap-3">
                  {[{ icon: Twitter, label: "Twitter" }, { icon: Github, label: "GitHub" }, { icon: Linkedin, label: "LinkedIn" }].map((social) => (
                    <motion.a key={social.label} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} href="#" aria-label={social.label} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = `${LIME}15`; (e.currentTarget as HTMLElement).style.borderColor = `${LIME}30`; (e.currentTarget as HTMLElement).style.color = LIME; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}>
                      <social.icon size={16} strokeWidth={2} />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Link Columns */}
              {[{ title: "Product", links: ["Features", "Pricing", "API", "Changelog"] }, { title: "Company", links: ["About", "Blog", "Careers", "Contact"] }, { title: "Legal", links: ["Privacy", "Terms", "Cookie Policy"] }].map((col) => (
                <div key={col.title}>
                  <h4 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-sm font-medium transition-colors" style={{ color: "rgba(255,255,255,0.35)" }} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = LIME; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}>{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="mt-12 pt-8" style={{ borderTop: `1px solid rgba(255,255,255,0.08)` }}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>© 2026 FlowCity · Made with ❤️ in Mumbai 🇮🇳</p>

                {/* Status + Version */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: LIME }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>All systems operational</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ backgroundColor: `${LIME}10`, color: `${LIME}80`, border: `1px solid ${LIME}20` }}>v2.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}