/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowLeft, Zap, Rocket, Users, Lock, ChevronRight } from "lucide-react";
import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";

export default function BetaAccess() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleBack = (e: MouseEvent) => {
    e.preventDefault();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      lenis.destroy();
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bg-main text-charcoal font-sans selection:bg-charcoal/10">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-bg-main/80 backdrop-blur-lg border-b border-black/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="/" onClick={handleBack} className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-charcoal rounded flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowLeft className="text-white" size={16} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight text-charcoal uppercase">SOLID</span>
              <span className="text-[8px] font-black tracking-[0.3em] text-slate-400 -mt-0.5 ml-0.5">BETA</span>
            </div>
          </a>
          <a href="/" onClick={handleBack} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-charcoal transition-colors">
            Exit
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 border border-black/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">
              <Lock size={12} />
              <span>Limited Early Access</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 uppercase leading-[0.9] text-charcoal">
              Shape the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-charcoal to-slate-400">Intelligent</span> <br /> Future.
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-12 max-w-xl font-medium">
              We're opening a limited number of spots for our private beta, including exclusive early access to our <span className="text-charcoal font-black">Alpha Model v1.2 Release</span>. Join the developer cohort helping us optimize SolidAI for real-world deployments across Africa.
            </p>

            <div className="space-y-6">
              {[
                { icon: Zap, text: "Early access to Model v1.2 weights" },
                { icon: Users, text: "Dedicated technical support channel" },
                { icon: Rocket, text: "Influence our product roadmap" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center border border-black/10 shrink-0">
                    <item.icon size={12} className="text-charcoal" />
                  </div>
                  <span className="font-bold text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card p-10 relative overflow-hidden bg-white border-black/5 shadow-2xl"
          >
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-charcoal text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Rocket size={32} />
                </div>
                <h2 className="text-3xl font-black mb-4 text-charcoal tracking-tight">You're on the list!</h2>
                <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium leading-relaxed">
                  Thank you for your interest in the SolidAI Beta. We'll reach out to you as soon as a spot becomes available.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-black uppercase tracking-widest text-charcoal hover:border-b-2 border-charcoal transition-all"
                >
                  Apply another email
                </button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-2xl font-black mb-2 text-charcoal tracking-tight">Request Access</h2>
                <p className="text-slate-500 mb-8 text-sm font-medium">Tell us about your project or organization.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">First Name</label>
                      <input required className="w-full bg-slate-50 border border-black/10 rounded-lg px-4 py-3 focus:outline-none focus:border-charcoal/30 transition-all font-medium" placeholder="Jane" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last Name</label>
                      <input required className="w-full bg-slate-50 border border-black/10 rounded-lg px-4 py-3 focus:outline-none focus:border-charcoal/30 transition-all font-medium" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Work Email</label>
                    <input required type="email" className="w-full bg-slate-50 border border-black/10 rounded-lg px-4 py-3 focus:outline-none focus:border-charcoal/30 transition-all font-medium" placeholder="jane@company.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Project Description</label>
                    <textarea rows={3} className="w-full bg-slate-50 border border-black/10 rounded-lg px-4 py-3 focus:outline-none focus:border-charcoal/30 transition-all font-medium" placeholder="How do you plan to use SolidAI?"></textarea>
                  </div>
                  <button type="submit" className="w-full py-4 bg-charcoal text-white font-black uppercase tracking-widest text-xs rounded shadow-2xl hover:shadow-black/20 transition-all flex items-center justify-center gap-2 group">
                    Join Waitlist <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
