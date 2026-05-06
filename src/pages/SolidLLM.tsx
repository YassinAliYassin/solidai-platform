/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Brain, 
  Cpu, 
  MessageSquare, 
  Globe, 
  ArrowLeft, 
  Sparkles,
  Zap,
  Shield,
  Code
} from "lucide-react";
import { useState, useEffect, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";

export default function SolidLLM() {
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
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

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
    <div className="min-h-screen font-sans selection:bg-white/10 bg-[#0A0A0A] text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="/" onClick={handleBack} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowLeft className="text-black" size={16} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SOLID AI</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="/solid-llm/about" className="hover:text-white transition-colors">About</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="/" onClick={handleBack} className="px-5 py-2 border border-white text-white rounded-full hover:bg-white hover:text-black transition-all">Back to Home</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-white text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Sparkles size={14} className="text-slate-400" />
              <span>Solid Solutions AI Research & Development Hub</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[0.9] uppercase"
            >
              Intelligence <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-500 to-white">Optimized</span> <br /> For Africa.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              Our dedicated center for exploring the practical applications of artificial intelligence in the African context. Moving beyond theoretical models to build AI that understands local languages and powers the next generation of digital infrastructure.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <a href="/beta" className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded shadow-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3 group text-center">
                Try SolidAI Beta <Zap size={18} className="fill-current" />
              </a>
              <a href="/documentation" className="w-full sm:w-auto px-10 py-5 bg-transparent text-white border border-white/20 font-bold uppercase tracking-widest text-xs rounded hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-center">
                Technical Documentation
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-4">Uncompromising Performance</h2>
            <p className="text-slate-400 max-w-xl mx-auto">SolidAI is built from the ground up to address the specific challenges of deploying advanced AI across the African continent.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Hyper-Local NLP",
                desc: "Deep understanding of diverse regional dialects and languages, moving beyond standard English-centric training.",
                icon: Brain
              },
              {
                title: "Edge Efficiency",
                desc: "Optimized model quantization that allows sophisticated reasoning on low-power hardware without constant cloud connectivity.",
                icon: Cpu
              },
              {
                title: "Privacy-First",
                desc: "Sovereign data management protocols ensuring that sensitive African data stays within defined boundaries.",
                icon: Shield
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 bg-white/5 border border-white/10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white mb-8">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section id="architecture" className="py-24 relative overflow-hidden bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">The Architecture of Next-Gen AI.</h2>
              <p className="text-lg text-slate-400 mb-12 leading-relaxed">
                Our model utilizes a hybrid Mixture-of-Experts (MoE) architecture, enabling dynamic allocation of parameters for specific tasks. This results in faster response times and significantly lower energy consumption for large-scale operations.
              </p>
              
              <ul className="space-y-6">
                {[
                  "Hyper-local NLP for diverse African dialects",
                  "Agri-Tech Intelligence for crop disease detection",
                  "Predictive models for inclusive financial services",
                  "Edge-AI Deployment on low-power hardware"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0">
                      <Code size={14} />
                    </div>
                    <span className="font-semibold text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-40 bg-white rounded-2xl p-6 flex flex-col justify-end text-black">
                  <div className="text-3xl font-bold mb-1">1.2B</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60">Edge Parameters</div>
                </div>
                <div className="h-64 bg-white/5 rounded-2xl p-6 flex flex-col justify-end text-white border border-white/10">
                  <Globe className="mb-auto opacity-20" size={40} />
                  <div className="text-3xl font-bold mb-1">50+</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60">African Dialects</div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 bg-[#1A1A1A] rounded-2xl p-6 flex flex-col justify-end text-white border border-white/5">
                  <Cpu className="mb-auto opacity-20" size={40} />
                  <div className="text-3xl font-bold mb-1">4bit</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60">Native Precision</div>
                </div>
                <div className="h-40 bg-white text-black rounded-2xl p-6 flex flex-col justify-end">
                  <div className="text-3xl font-bold mb-1">Sub-10ms</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60">Inference Latency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-tight">Ready to Build <br /> with SolidAI?</h2>
            <p className="text-xl text-black/70 mb-12 leading-relaxed">
              Join our developer network and get early access to our APIs and specialized models for industrial and financial applications.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="/beta" className="w-full sm:w-auto px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-xs rounded hover:bg-[#222] transition-all text-center">
                Request Developer Key
              </a>
              <a href="/#contact" className="w-full sm:w-auto px-10 py-5 bg-transparent border border-black/30 font-bold uppercase tracking-widest text-xs rounded hover:bg-black/5 transition-all text-center">
                Contact Enterprise Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-black rounded-sm"></div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white uppercase">SOLID SOLUTIONS</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/coming-soon" className="hover:text-white transition-colors">Privacy</a>
            <a href="/coming-soon" className="hover:text-white transition-colors">Twitter</a>
            <a href="/coming-soon" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="text-slate-600 text-sm">© 2026 Solid Solutions. Africa's Future Built To Last.</p>
        </div>
      </footer>
    </div>
  );
}
