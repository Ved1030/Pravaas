import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, AtSign, Mail, Phone, MapPin, Lock, Train, Bus, Car, Footprints, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    city: "Mumbai, Maharashtra",
    password: "",
    confirm: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prefs, setPrefs] = useState<string[]>(['metro', 'bus']);
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    let newErrors: Record<string, string> = {};
    if (!formData.name || formData.name.length < 2) newErrors.name = "Name is required";
    if (!formData.username || formData.username.length < 3 || formData.username.includes(" ")) newErrors.username = "Valid username required (no spaces)";
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email required";
    if (!formData.password || formData.password.length < 8) newErrors.password = "Min 8 characters required";
    if (formData.password !== formData.confirm) newErrors.confirm = "Passwords must match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = () => {
    // Optionally trigger validation on blur
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));

    signup({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      transportPrefs: prefs
    });

    navigate("/dashboard");
  };

  const togglePref = (mode: string) => {
    setPrefs(p => p.includes(mode) ? p.filter(x => x !== mode) : [...p, mode]);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] font-sans relative overflow-hidden">

      {/* LEFT COLUMN - Brand Panel (Fixed on Desktop) */}
      <div className="hidden lg:flex flex-col w-1/2 fixed inset-y-0 left-0 bg-[#1b3a2a] p-12 z-10 overflow-hidden">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3">
           <div className="w-15 h-15 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100">
                    <img
                      src="/logo3.png"
                      alt="FlowCity Logo"
                      className="w-10 h-10 object-contain rounded-2xl"
                    />
                  </div>
          <span className="text-3xl font-bold text-white tracking-tight">FlowCity</span>
        </div>

        {/* Mini Dashboard Card */}
              {/* Image Card */}
              <div className="flex-1 flex items-center justify-center z-10 px-6">
                <div className="w-full max-w-[420px]">
                  <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-4 border border-white/15 shadow-2xl relative overflow-hidden">

                    <motion.img
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6 }}
                      src="/signup.png"
                      alt="Smart Travel Planning"
                      className="w-full h-[480px] object-cover rounded-[24px]"
                    />

                  </div>
                </div>
              </div>
        {/* Footer Stats */}
        <div className="absolute bottom-8 left-12 right-12 flex items-center justify-between z-10 mt-16">
          <p className="text-white/70 font-medium text-sm">Join 12,000+ commuters</p>
          <div className="flex -space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-[#1b3a2a] flex items-center justify-center font-bold text-blue-700 text-sm">AK</div>
            <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-[#1b3a2a] flex items-center justify-center font-bold text-amber-700 text-sm">SR</div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-[#1b3a2a] flex items-center justify-center font-bold text-emerald-700 text-sm">PM</div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Form Scrollable Container */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] min-h-screen lg:h-screen flex flex-col items-center relative z-20 overflow-y-auto lg:overflow-y-auto bg-[#FAFAFA]">

        <div className="w-full max-w-[480px] px-6 py-12 lg:py-16 mx-auto">

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Create your account</h1>
            <p className="text-base text-gray-500 font-medium mt-2">Start your smarter commute today</p>
          </div>

          <motion.form
            variants={stagger}
            initial="hidden"
            animate="show"
            onSubmit={handleSubmit}
            className="bg-white rounded-[32px] p-8 lg:p-10 shadow-xl border border-gray-100 w-full relative z-10"
          >
            <div className="space-y-6">
              {/* Full Name */}
              <motion.div variants={fadeUp}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b3a2a] transition-colors" size={20} strokeWidth={2.5} />
                  <input
                    type="text"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-gray-300'} text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#1b3a2a]/10 focus:bg-white`}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 font-medium mt-2 px-1 bg-red-50 inline-block rounded">{errors.name}</p>}
              </motion.div>

              {/* Username */}
              <motion.div variants={fadeUp}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">Username</label>
                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b3a2a] transition-colors" size={20} strokeWidth={2.5} />
                  <input
                    type="text"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border ${errors.username ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-gray-300'} text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#1b3a2a]/10 focus:bg-white`}
                    placeholder="John Doe"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  />
                </div>
                {errors.username && <p className="text-xs text-red-500 font-medium mt-2 px-1 bg-red-50 inline-block rounded">{errors.username}</p>}
              </motion.div>

              {/* Email */}
              <motion.div variants={fadeUp}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b3a2a] transition-colors" size={20} strokeWidth={2.5} />
                  <input
                    type="email"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-gray-300'} text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#1b3a2a]/10 focus:bg-white`}
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-medium mt-2 px-1 bg-red-50 inline-block rounded">{errors.email}</p>}
              </motion.div>

              {/* Phone & City Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div variants={fadeUp}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b3a2a] transition-colors" size={20} strokeWidth={2.5} />
                    <input
                      type="tel"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1b3a2a]/10 focus:border-gray-300 focus:bg-white transition-all"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">City</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b3a2a] transition-colors" size={20} strokeWidth={2.5} />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1b3a2a]/10 focus:border-gray-300 focus:bg-white transition-all"
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Password */}
              <motion.div variants={fadeUp}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b3a2a] transition-colors" size={20} strokeWidth={2.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 rounded-xl border ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-gray-300'} text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#1b3a2a]/10 focus:bg-white`}
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 font-medium mt-2 px-1 bg-red-50 inline-block rounded">{errors.password}</p>}
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={fadeUp}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1b3a2a] transition-colors" size={20} strokeWidth={2.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 rounded-xl border ${errors.confirm ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-gray-300'} text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-[#1b3a2a]/10 focus:bg-white`}
                    placeholder="Re-enter password"
                    value={formData.confirm}
                    onChange={e => setFormData({ ...formData, confirm: e.target.value })}
                  />
                </div>
                {errors.confirm && <p className="text-xs text-red-500 font-medium mt-2 px-1 bg-red-50 inline-block rounded">{errors.confirm}</p>}
              </motion.div>

              {/* Terms */}
              <motion.label variants={fadeUp} className="flex items-start gap-3 mt-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    required
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-[#1b3a2a] checked:border-[#1b3a2a] transition-all"
                  />
                  <CheckIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-sm text-gray-600 font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                  I agree to the <a href="#" className="text-[#1b3a2a] font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-[#1b3a2a] font-bold hover:underline">Privacy Policy</a>
                </span>
              </motion.label>

              {/* Submit Button */}
              <motion.button
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full mt-2 bg-[#1b3a2a] text-white rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}
              </motion.button>

              {/* Divider */}
              <motion.div variants={fadeUp} className="relative py-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">or continue with</div>
              </motion.div>

              {/* Social Buttons */}
              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                <button type="button" className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl py-3.5 border border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Google
                </button>
                <button type="button" className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl py-3.5 border border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.11-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  GitHub
                </button>
              </motion.div>
            </div>
          </motion.form>

          {/* Login Link */}
          <p className="text-center text-base font-medium text-gray-500 mt-8 mb-12 lg:mb-0">
            Already have an account? <Link to="/login" className="text-[#1b3a2a] font-bold hover:underline transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper for Checkbox Icon
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={props.className} {...props}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}