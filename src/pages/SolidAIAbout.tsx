/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Info, 
  Target, 
  Compass, 
  Users, 
  Globe,
  Database,
  Cpu,
  ShieldCheck
} from "lucide-react";
import { useState, useEffect, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";

export default function SolidAIAbout() {
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
          <a href="/solid-llm" onClick={handleBack} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowLeft className="text-black" size={16} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">ABOUT SOLID AI</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs mb-6"
            >
              <Info size={16} />
              <span>Our Mission & Vision</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-[0.95] uppercase"
            >
              Intelligence <br /> Crafted for the <br /> <span className="text-slate-500">African Continent.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-400 leading-relaxed"
            >
              SolidAI is more than just a large language model. It's a foundational effort to build digital sovereignty through localized intelligence, optimized for Africa's unique infrastructure and linguistic diversity.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center">
                <Target size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white">Hyper-Localization</h3>
              <p className="text-slate-400 leading-relaxed">
                Standard LLMs are trained on predominantly Western data. We prioritize the training and fine-tuning of models on African dialects, socio-economic contexts, and regional knowledge systems.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center">
                <Compass size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white">Resilient Architecture</h3>
              <p className="text-slate-400 leading-relaxed">
                We design for environments where connectivity can be inconsistent. Our models are optimized for edge deployment, allowing complex reasoning to happen on-device or on local nodes.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white">Data Sovereignty</h3>
              <p className="text-slate-400 leading-relaxed">
                We believe in the "Right to Data." Our systems are built to ensure that critical African infrastructure and personal information remain governed by local privacy and security standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-[#0F0F0F] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square bg-white/5 rounded-3xl p-12 flex items-center justify-center border border-white/10">
                <div className="relative w-full h-full">
                  <div className="absolute top-0 left-0 w-full h-full border border-white/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute inset-4 border border-white/10 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">Layer 0</div>
                      <div className="text-xs uppercase tracking-widest opacity-50">Foundation Intelligence</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold mb-8 tracking-tight uppercase">Evolving Beyond <br /> Prediction.</h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Most AI today is trained to predict the next word. SolidAI is being developed to solve actual problems—from optimizing supply chains in remote areas to providing accurate medical guidance in local languages.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Users, text: "Community-driven research and feedback loops" },
                  { icon: Cpu, text: "Hardware-aware model optimization" },
                  { icon: Database, text: "Clean, verified, and inclusive datasets" },
                  { icon: Globe, text: "Deployment across terrestrial and satellite networks" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                    <item.icon size={20} className="text-white/60" />
                    <span className="font-medium text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
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
            <a href="/solid-llm" className="hover:text-white transition-colors">SolidAI</a>
            <a href="/coming-soon" className="hover:text-white transition-colors">Twitter</a>
            <a href="/coming-soon" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="text-slate-600 text-sm">© 2026 Solid Solutions. Intelligence for the Future.</p>
        </div>
      </footer>
    </div>
  );
}
