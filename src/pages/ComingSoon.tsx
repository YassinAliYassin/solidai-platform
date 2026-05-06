/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowLeft, Globe, Twitter, Github, Linkedin, Mail } from "lucide-react";
import { useState, useEffect, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";

export default function ComingSoon() {
  const [isScrolled, setIsScrolled] = useState(false);
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

  return (
    <div className="min-h-screen bg-bg-main text-charcoal font-sans selection:bg-charcoal/10 flex flex-col">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-bg-main/80 backdrop-blur-lg border-b border-black/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="/" onClick={handleBack} className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-charcoal rounded flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowLeft className="text-white" size={16} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight text-charcoal uppercase">SOLID</span>
              <span className="text-[8px] font-black tracking-[0.3em] text-slate-400 -mt-0.5 ml-0.5">SOLUTIONS</span>
            </div>
          </a>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-black/5 border border-black/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-sm"
          >
            <Globe className="text-charcoal animate-pulse" size={40} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-8 uppercase text-charcoal"
          >
            Coming <span className="text-slate-400">Soon</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 mb-12 leading-relaxed font-medium"
          >
            We're currently building our digital presence across various platforms. Our official social channels and specialized portals will be launching shortly.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 text-slate-400"
          >
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <Twitter size={24} className="group-hover:text-charcoal transition-colors" />
              <span className="text-[10px] uppercase tracking-widest font-black">Twitter</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <Github size={24} className="group-hover:text-charcoal transition-colors" />
              <span className="text-[10px] uppercase tracking-widest font-black">GitHub</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <Linkedin size={24} className="group-hover:text-charcoal transition-colors" />
              <span className="text-[10px] uppercase tracking-widest font-black">LinkedIn</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <Mail size={24} className="group-hover:text-charcoal transition-colors" />
              <span className="text-[10px] uppercase tracking-widest font-black">Email</span>
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="py-12 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <a href="/" onClick={handleBack} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-charcoal transition-colors">Return to Homepage</a>
        </div>
      </footer>
    </div>
  );
}
