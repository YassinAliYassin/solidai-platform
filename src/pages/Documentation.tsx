/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowLeft, Book, Code, Terminal, Zap, Search, ChevronRight } from "lucide-react";
import { useState, useEffect, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";
import { Check } from "lucide-react";

export default function Documentation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleBack = (e: MouseEvent) => {
    e.preventDefault();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("npm install @solid-solutions/ai-sdk");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <span className="text-[8px] font-black tracking-[0.3em] text-slate-400 -mt-0.5 ml-0.5">DOCS</span>
            </div>
          </a>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search documentation..." 
              className="bg-black/5 border border-black/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-black/30 w-64 transition-all font-medium"
            />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 grid lg:grid-cols-[250px_1fr_200px] gap-12">
        {/* Sidebar */}
        <aside className="hidden lg:block space-y-8 sticky top-32 h-fit">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Getting Started</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-bold">
              <li className="text-charcoal font-black">Introduction</li>
              <li className="hover:text-charcoal cursor-pointer transition-colors">Quickstart Guide</li>
              <li className="hover:text-charcoal cursor-pointer transition-colors">Core Concepts</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">API Reference</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-bold">
              <li className="hover:text-charcoal cursor-pointer transition-colors">Authentication</li>
              <li className="hover:text-charcoal cursor-pointer transition-colors">Endpoints</li>
              <li className="hover:text-charcoal cursor-pointer transition-colors">Rate Limits</li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black tracking-tighter mb-6 text-charcoal">Documentation</h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-12 font-medium">
              Learn how to integrate SolidAI into your applications. Our documentation covers everything from basic setup to advanced fine-tuning for specialized industrial use-cases.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-16">
              <div className="p-8 glass-card border-black/5 bg-white shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                <Book className="text-slate-400 mb-4 group-hover:text-charcoal transition-colors" size={32} />
                <h3 className="font-black text-lg mb-2">Guides</h3>
                <p className="text-sm text-slate-500 font-medium">Step-by-step tutorials to get you up and running in minutes.</p>
              </div>
              <div className="p-8 glass-card border-black/5 bg-white shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                <Code className="text-slate-400 mb-4 group-hover:text-charcoal transition-colors" size={32} />
                <h3 className="font-black text-lg mb-2">API Explorer</h3>
                <p className="text-sm text-slate-500 font-medium">Interactive tool to test API calls in your browser.</p>
              </div>
            </div>

            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-charcoal uppercase tracking-tight">
              <Terminal size={24} className="text-slate-400" />
              Quick Installation
            </h2>
            <div className="bg-slate-900 border border-black/10 rounded-xl p-6 font-mono text-sm overflow-x-auto mb-6 shadow-2xl relative group/code">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                <span className="text-slate-500 font-bold">Bash</span>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>Copy</>
                  )}
                </button>
              </div>
              <div className="text-slate-300">
                <span className="text-white/20">$</span> npm install @solid-solutions/ai-sdk
              </div>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-12 ml-1">
              Note: This installs the core neural processing engine into your local terminal environment.
            </p>

            <div className="p-10 bg-charcoal rounded-2xl text-white shadow-2xl shadow-charcoal/20 relative overflow-hidden group/model">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -tr-40 group-hover/model:scale-110 transition-transform duration-700"></div>
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center shrink-0 shadow-xl group-hover/model:rotate-12 transition-transform">
                  <Zap size={24} />
                </div>
                <div>
                  <div className="inline-block px-2 py-0.5 bg-white/10 text-[8px] font-black uppercase tracking-widest rounded mb-2 border border-white/10">
                    Latest Release
                  </div>
                  <h3 className="text-xl font-bold mb-2">Alpha Model v1.2 Release</h3>
                  <p className="text-white/70 mb-6 leading-relaxed font-bold">
                    Experience our most efficient edge model yet. 40% faster inference with zero accuracy loss, optimized specifically for African regional devices.
                  </p>
                  <a href="/beta" className="inline-flex items-center gap-2 font-black uppercase tracking-widest text-xs group/btn bg-white/10 hover:bg-white text-white hover:text-charcoal px-4 py-2 rounded transition-all">
                    Test the Model <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Table of Contents */}
        <aside className="hidden xl:block">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">On this page</h4>
          <ul className="space-y-3 text-xs text-slate-500 font-bold">
            <li className="text-charcoal">Introduction</li>
            <li className="hover:text-charcoal cursor-pointer transition-colors">Core Features</li>
            <li className="hover:text-charcoal cursor-pointer transition-colors">Installation</li>
            <li className="hover:text-charcoal cursor-pointer transition-colors">SDK Overview</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
