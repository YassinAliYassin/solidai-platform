/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  Network, 
  Database, 
  Microscope, 
  Smartphone, 
  Globe, 
  ArrowRight, 
  Mail, 
  MapPin, 
  ChevronRight,
  Layers,
  Users,
  Lightbulb,
  Rocket,
  Code,
  Shield,
  Brain
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import Logo from "../components/Logo";

const SectionTitle = ({ children, subtitle }: { children: ReactNode, subtitle?: string }) => (
  <div className="mb-12">
    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-charcoal mb-4">
      {children}
    </h2>
    {subtitle && (
      <p className="text-slate-600 max-w-2xl font-medium">
        {subtitle}
      </p>
    )}
  </div>
);

const Card = ({ title, description, icon: Icon, highlight = false, href, onClick }: { title: string, description: string, icon: any, highlight?: boolean, href?: string, onClick?: () => void }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`glass-card p-8 flex flex-col h-full ${highlight ? 'border-charcoal/5 bg-charcoal/5' : ''}`}
  >
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${highlight ? 'bg-charcoal text-white shadow-lg' : 'bg-black/5 text-slate-500'}`}>
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-charcoal mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed flex-grow font-medium">{description}</p>
    {onClick ? (
      <button 
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className="mt-6 flex items-center text-charcoal text-sm font-bold group cursor-pointer hover:opacity-100 transition-opacity w-fit"
      >
        Learn more <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
      </button>
    ) : href ? (
      <a href={href} className="mt-6 flex items-center text-charcoal text-sm font-bold group cursor-pointer hover:opacity-100 transition-opacity">
        Learn more <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
      </a>
    ) : (
      <div className="mt-6 flex items-center text-charcoal text-sm font-bold group cursor-pointer hover:opacity-100 transition-opacity">
        Learn more <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    )}
  </motion.div>
);

const FlipCard = ({ name, icon: Icon, description, href, onAction }: { name: string, icon: any, description: string, href?: string, onAction?: () => void, key?: any }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="perspective-1000 h-56 w-full group"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden glass-card p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center mb-4 text-charcoal group-hover:bg-charcoal group-hover:text-white transition-colors duration-300">
            <Icon size={24} />
          </div>
          <span className="text-sm font-bold text-charcoal">{name}</span>
          <div className="mt-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            Hover to explore
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden p-6 flex flex-col items-center justify-center text-center bg-white text-black rotate-y-180 rounded-xl"
        >
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-black/60">{name}</h4>
          <p className="text-xs leading-relaxed text-black font-medium mb-4">{description}</p>
          {href ? (
            <a href={href} className="text-[10px] font-bold uppercase tracking-widest border-b border-black/20 hover:border-black transition-colors">Action <ArrowRight size={10} className="inline ml-1" /></a>
          ) : onAction ? (
            <button onClick={(e) => { e.stopPropagation(); onAction(); }} className="text-[10px] font-bold uppercase tracking-widest border-b border-black/20 hover:border-black transition-colors">Action <ArrowRight size={10} className="inline ml-1" /></button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  const [lastScrollPos, setLastScrollPos] = useState(0);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    // Restore scroll position on mount
    const savedPos = sessionStorage.getItem('home_scroll_pos');
    if (savedPos && !activeDetail) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPos));
      }, 100);
    }
    
    return () => {
      // Save scroll position on unmount
      if (!activeDetail) {
        sessionStorage.setItem('home_scroll_pos', window.scrollY.toString());
      }
      window.removeEventListener("scroll", handleScroll);
      lenis.destroy();
    };
  }, [activeDetail]);

  const handleOpenDetail = (id: string) => {
    setLastScrollPos(window.scrollY);
    setActiveDetail(id);
    window.scrollTo(0, 0);
  };

  const handleCloseDetail = () => {
    setActiveDetail(null);
    setTimeout(() => {
      window.scrollTo({
        top: lastScrollPos,
        behavior: 'smooth'
      });
    }, 50);
  };

  const detailContent: Record<string, { title: string, icon: any, content: string, points: string[] }> = {
    systems: {
      title: "Core Systems Architecture",
      icon: Layers,
      content: "Our systems are built on a foundation of resilience, scalability, and efficiency. We focus on creating integrated environments where software and hardware work in perfect harmony to solve complex African challenges.",
      points: [
        "Distributed Cloud Infrastructure",
        "Edge Computing Optimization",
        "Automated System Recovery",
        "Hardware-Software Co-design"
      ]
    },
    community: {
      title: "Developer & Builder Community",
      icon: Users,
      content: "Innovation doesn't happen in a vacuum. We are building a vibrant ecosystem of developers, engineers, and creators who are passionate about building the future of African technology. Connect with us at info@solidsolutions.africa to learn more about our initiatives and how you can get involved.",
      points: [
        "Open Source Collaboration: Contributing to and maintaining critical infrastructure projects.",
        "Technical Mentorship Programs: Guiding the next generation of African engineers.",
        "Builder Workshops & Hackathons: Hands-on learning and rapid prototyping events.",
        "Cross-border Knowledge Sharing: Connecting tech hubs across the continent."
      ]
    },
    research: {
      title: "Advanced Technology Research",
      icon: Microscope,
      content: "Our research initiatives push the boundaries of what's possible. From AI-driven insights to sustainable hardware manufacturing, we use data to drive long-term technological progress.",
      points: [
        "Applied AI & Machine Learning",
        "Sustainable Materials Science",
        "Digital Economy Impact Studies",
        "Next-Gen Hardware Prototyping"
      ]
    },
    ai_hub: {
      title: "AI Research & Development Hub",
      icon: Cpu,
      content: "The AI Hub is our dedicated center for exploring the practical applications of artificial intelligence in the African context. We are moving beyond theoretical models to build AI that understands local languages, optimizes agricultural yields, and powers the next generation of African fintech.",
      points: [
        "Hyper-local NLP: Developing language models for diverse African dialects.",
        "Agri-Tech Intelligence: Computer vision for real-time crop disease detection.",
        "Fintech Optimization: Predictive models for inclusive financial services.",
        "Edge-AI Deployment: Running complex models on low-power hardware."
      ]
    },
    hardware: {
      title: "Hardware Innovation & Assembly",
      icon: Smartphone,
      content: "We are building the foundation for a robust hardware ecosystem in Africa. Our mission is to transition from consumers to creators, designing and assembling high-performance devices that are optimized for local conditions—from heat resilience to energy efficiency.",
      points: [
        "Next-Gen Assembly: Establishing high-precision local assembly lines.",
        "Embedded Systems: Custom PCB design for industrial IoT applications.",
        "Sustainable Design: Using modular components to extend device lifecycles.",
        "Silicon Collaboration: Researching specialized chips for edge computing."
      ]
    },
    infrastructure: {
      title: "Scalable Digital Infrastructure",
      icon: Database,
      content: "Digital infrastructure is the backbone of the modern economy. We develop the systems, networks, and platforms that enable seamless connectivity and data management across the continent, ensuring that African businesses can compete on a global scale.",
      points: [
        "Distributed Cloud: Building resilient, localized data center networks.",
        "Low-Latency Mesh: Innovative connectivity solutions for remote areas.",
        "Secure Data Vaults: Advanced encryption and sovereign data management.",
        "API Ecosystems: Standardized protocols for cross-platform integration."
      ]
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-charcoal/10">
      <AnimatePresence mode="wait">
        {activeDetail ? (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen pt-32 pb-24 px-6 max-w-5xl mx-auto"
          >
            <button 
              onClick={handleCloseDetail}
              className="mb-12 flex items-center gap-2 text-slate-500 hover:text-charcoal transition-colors group"
            >
              <ArrowRight className="rotate-180" size={20} />
              <span className="font-bold uppercase tracking-widest text-xs">Back to Overview</span>
            </button>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-20 h-20 rounded-2xl bg-charcoal text-white flex items-center justify-center shadow-2xl mb-8">
                  {(() => {
                    const Icon = detailContent[activeDetail].icon;
                    return <Icon size={40} />;
                  })()}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-charcoal">
                  {detailContent[activeDetail].title}
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
                  {detailContent[activeDetail].content}
                </p>
              </div>
              <div className="glass-card p-10 border-black/5 bg-white shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-slate-500">Key Focus Areas</h3>
                <div className="space-y-6">
                  {detailContent[activeDetail].points.map((point, i) => (
                    <div key={i} className="flex items-start gap-4 text-slate-700">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-charcoal"></div>
                      <span className="text-lg font-bold text-charcoal">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-bg-main/80 backdrop-blur-lg border-b border-black/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <Logo width={32} height={32} className="transition-transform group-hover:rotate-12" />
            <div className="flex flex-col leading-none">
              <span className="text-base font-black tracking-tight text-charcoal uppercase">SOLID</span>
              <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 -mt-0.5 ml-0.5">SOLUTIONS</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <a href="#about" className="hover:text-charcoal transition-colors">About</a>
            <a href="#mission" className="hover:text-charcoal transition-colors">Mission</a>
            <a href="#pillars" className="hover:text-charcoal transition-colors">Technology</a>
            <a href="#roadmap" className="hover:text-charcoal transition-colors">Roadmap</a>
            <a href="#contact" className="px-5 py-2 bg-charcoal text-white rounded shadow-xl hover:shadow-black/20 transition-all">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden grid-pattern bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-main/50 to-bg-main pointer-events-none"></div>
        
        {/* Abstract Visuals */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-block px-3 py-1 bg-black/5 text-charcoal text-[10px] font-bold tracking-[0.2em] uppercase rounded border border-black/10 mb-8 backdrop-blur-sm">
                Africa's Next Generation
              </span>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-charcoal mb-6 leading-none uppercase">
                <span className="block">Building</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-charcoal to-slate-400">Africa's</span>
                <span className="block">Future.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl font-medium">
                An emerging initiative focused on artificial intelligence, digital infrastructure, and future hardware manufacturing. Building practical systems that support Africa’s evolving digital economy.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <a href="#mission" className="px-8 py-4 bg-charcoal text-white font-bold uppercase tracking-wider text-sm rounded shadow-2xl hover:shadow-black/20 transition-all flex items-center justify-center gap-3 group">
                  Explore Our Vision <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                </a>
                <a href="#contact" className="px-8 py-4 bg-black/5 text-charcoal font-bold uppercase tracking-wider text-sm rounded border border-black/10 hover:bg-black/10 transition-all flex items-center justify-center">
                  Contact Us
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-bg-dark relative overflow-hidden border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <SectionTitle>A Technology Initiative for Africa’s Digital Future</SectionTitle>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
              Solid Solutions is focused on strengthening Africa’s role in the global technology ecosystem through research collaboration, infrastructure development, and long-term hardware innovation.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Our goal is to support a new generation of builders creating technologies designed for real-world environments.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-24 grid-pattern bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle subtitle="Strengthening Africa’s technological capability through research, collaboration, and the development of scalable digital systems.">
            Our Mission
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 glass-card h-full bg-slate-50 border-black/5 shadow-sm">
              <h3 className="text-charcoal font-black uppercase tracking-widest text-xs mb-4">The Challenge</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Africa’s digital economy is growing rapidly, yet much of the underlying technology infrastructure and hardware manufacturing remains external.
              </p>
            </div>
            <div className="p-8 glass-card h-full bg-slate-50 border-black/5 shadow-sm">
              <h3 className="text-charcoal font-black uppercase tracking-widest text-xs mb-4">The Opportunity</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                A growing developer community and expanding connectivity create the foundation for new technological innovation.
              </p>
            </div>
            <div className="p-8 glass-card h-full bg-slate-50 border-black/5 shadow-sm">
              <h3 className="text-charcoal font-black uppercase tracking-widest text-xs mb-4">Our Focus</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Supporting research, collaboration, and infrastructure that enable African developers and engineers to build globally competitive technologies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solid AI Featured Section */}
      <section id="solid-ai" className="py-32 bg-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-3 py-1 bg-white/10 text-white text-[10px] font-black tracking-[0.2em] uppercase rounded border border-white/20 mb-8">
                Featured Initiative
              </span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 uppercase leading-none">
                Solid AI: The <br /> Intelligence <br /> Layer
              </h2>
              <p className="text-xl text-white/70 leading-relaxed mb-12 font-medium max-w-xl">
                Developing specialized large language models and cognitive systems designed to understand and process the unique linguistic and structural complexities of African environments.
              </p>
              <a href="/solid-llm" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-charcoal font-black uppercase tracking-widest text-xs rounded shadow-2xl hover:scale-105 transition-all">
                Access Solid AI <ArrowRight size={16} />
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card bg-white/5 border-white/10 p-2 rounded-2xl">
                <div className="bg-white/10 rounded-xl p-8 backdrop-blur-3xl">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-lg bg-white text-charcoal flex items-center justify-center shadow-xl">
                        <Brain size={24} />
                     </div>
                     <div>
                        <h4 className="font-black uppercase tracking-widest text-sm">Neural Engine</h4>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest">Active Inference</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Token Generation", value: "98.4%", progress: 98 },
                      { label: "Context Window", value: "128k", progress: 85 },
                      { label: "Latency", value: "12ms", progress: 92 }
                    ].map((metric, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-white/70">
                          <span>{metric.label}</span>
                          <span>{metric.value}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${metric.progress}%` }}
                            className="h-full bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating accents */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Technology Pillars */}
      <section id="pillars" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle>Core Technology Pillars</SectionTitle>
          <div className="grid md:grid-cols-3 gap-8">
            <Card 
              title="AI Hub" 
              description="Research and developer collaboration focused on practical artificial intelligence applications for Africa." 
              icon={Cpu}
              highlight
              href="/solid-llm"
            />
            <Card 
              title="Hardware Innovation" 
              description="Exploring future smartphone assembly and embedded systems development to strengthen Africa’s hardware ecosystem." 
              icon={Smartphone}
              highlight
              onClick={() => handleOpenDetail('hardware')}
            />
            <Card 
              title="Digital Infrastructure" 
              description="Developing partnerships and systems that support scalable digital platforms." 
              icon={Database}
              highlight
              onClick={() => handleOpenDetail('infrastructure')}
            />
          </div>
        </div>
      </section>

      {/* Research & Innovation */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle subtitle="Solid Solutions explores technologies that support scalable digital systems.">
            Research and Innovation
          </SectionTitle>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { 
                name: "Artificial Intelligence", 
                icon: Brain,
                description: "Researching neural networks and machine learning models to solve complex local and global challenges.",
                href: "/solid-llm"
              },
              { 
                name: "Embedded Systems", 
                icon: Cpu,
                description: "Designing specialized computing systems for dedicated functions within larger mechanical or electrical systems.",
                onAction: () => handleOpenDetail('hardware')
              },
              { 
                name: "Edge Computing", 
                icon: Network,
                description: "Optimizing data processing at the network edge to reduce latency and improve real-time performance.",
                onAction: () => handleOpenDetail('infrastructure')
              },
              { 
                name: "Digital Infrastructure", 
                icon: Database,
                description: "Building the foundational systems and networks that power scalable digital platforms and services.",
                onAction: () => handleOpenDetail('infrastructure')
              },
              { 
                name: "Robotics and Automation", 
                icon: Rocket,
                description: "Developing intelligent machines and automated processes to enhance efficiency in various industries.",
                onAction: () => handleOpenDetail('systems')
              },
              { 
                name: "Cybersecurity", 
                icon: Shield,
                description: "Implementing advanced security protocols and systems to protect critical data and digital assets.",
                onAction: () => handleOpenDetail('systems')
              }
            ].map((item: any, i: number) => (
              <FlipCard 
                key={i} 
                name={item.name} 
                icon={item.icon} 
                description={item.description} 
                href={item.href}
                onAction={item.onAction}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Technology Architecture */}
      <section className="py-24 bg-bg-dark overflow-hidden border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle subtitle="Our vertical technology stack ensures seamless integration from silicon to software.">
            Technology Architecture
          </SectionTitle>
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Visual Stack - Interactive */}
            <div className="lg:col-span-7 perspective-1000">
              <div className="flex flex-col gap-4 relative">
                {[
                  { id: 'apps', label: "Applications", color: "bg-charcoal text-white", desc: "High-performance digital platforms and specialized AI interfaces designed for enterprise-grade scalability.", icon: Code },
                  { id: 'intel', label: "Intelligence Layer", color: "bg-slate-800 text-white", desc: "Neural processing units and machine learning models that provide automated decision-making and predictive analytics.", icon: Lightbulb },
                  { id: 'infra', label: "Infrastructure", color: "bg-slate-100 text-charcoal", desc: "Distributed cloud networks and low-latency connectivity protocols optimized for real-world environments.", icon: Network },
                  { id: 'hw', label: "Hardware", color: "bg-slate-50 text-charcoal", desc: "Custom-designed embedded systems and hardware assembly focused on edge-device efficiency.", icon: Smartphone }
                ].map((layer, i) => (
                  <motion.div
                    key={layer.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => {
                      const map: Record<string, string> = {
                        apps: 'systems',
                        intel: 'ai_hub',
                        infra: 'infrastructure',
                        hw: 'hardware'
                      };
                      handleOpenDetail(map[layer.id]);
                    }}
                    className={`group relative p-8 ${layer.color} border border-black/5 rounded-2xl shadow-xl cursor-pointer overflow-hidden`}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i < 2 ? 'bg-white/10' : 'bg-black/10'}`}>
                          <layer.icon size={20} />
                        </div>
                        <h4 className="text-lg font-extrabold tracking-tight uppercase">{layer.label}</h4>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono uppercase tracking-widest font-black">
                        Layer 0{4-i} (Expand)
                      </div>
                    </div>
                    <p className={`mt-4 text-sm max-w-xl leading-relaxed font-semibold ${i < 2 ? 'text-white/70' : 'text-slate-500'}`}>
                      {layer.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Context/Detail Side */}
            <div className="lg:col-span-5 space-y-8">
              <div className="glass-card p-8 border-black/5 bg-white shadow-2xl">
                <h3 className="text-charcoal font-black uppercase text-xs tracking-widest mb-4">Vertical Integration</h3>
                <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                  Our architecture is built as a cohesive ecosystem. Each layer is engineered to communicate directly with the adjacent tiers, eliminating the latency and security risks of fragmented systems.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Latency", value: "< 50ms" },
                    { label: "Uptime", value: "99.9%" },
                    { label: "Security", value: "End-to-End" },
                    { label: "Scale", value: "Elastic" }
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-black/5">
                      <div className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">{stat.label}</div>
                      <div className="text-charcoal font-black text-lg">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-8 bg-charcoal rounded-2xl text-white relative overflow-hidden shadow-2xl shadow-charcoal/20">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                      <Layers size={20} />
                    </div>
                    <h4 className="font-black uppercase tracking-widest text-sm">System Resilience</h4>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed font-medium">
                    Designed for high-availability, our architecture features automated failover and distributed redundancy at every layer of the stack.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Ecosystem */}
      <section className="py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card p-12 md:p-20 bg-slate-50 border-black/5 shadow-2xl">
            <div className="max-w-3xl">
              <SectionTitle subtitle="Solid Solutions welcomes collaboration from developers, engineers, researchers, and innovators.">
                Developer Ecosystem
              </SectionTitle>
              <div className="grid sm:grid-cols-3 gap-8 mb-12">
                <div>
                  <h4 className="text-charcoal font-black uppercase text-xs tracking-widest mb-3">Collaboration</h4>
                  <p className="text-slate-600 text-sm font-medium">Work on experimental AI and infrastructure projects.</p>
                </div>
                <div>
                  <h4 className="text-charcoal font-black uppercase text-xs tracking-widest mb-3">Research</h4>
                  <p className="text-slate-600 text-sm font-medium">Contribute to emerging technical initiatives.</p>
                </div>
                <div>
                  <h4 className="text-charcoal font-black uppercase text-xs tracking-widest mb-3">Innovation</h4>
                  <p className="text-slate-600 text-sm font-medium">Participate in early-stage technology development.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-charcoal text-white font-black uppercase tracking-widest text-xs rounded shadow-xl hover:shadow-black/20 transition-all"
              >
                Join the Developer Network
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Development Roadmap */}
      <section id="roadmap" className="py-24 bg-bg-dark border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle>Development Roadmap</SectionTitle>
          <div className="relative pt-12">
            <div className="absolute top-[4.5rem] left-0 w-full h-px bg-charcoal/10 hidden md:block"></div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { phase: "Phase 1", title: "Research and Planning", status: "Current", active: true, icon: Microscope },
                { phase: "Phase 2", title: "Developer Collaboration", status: "Upcoming", active: false, icon: Users },
                { phase: "Phase 3", title: "Technology Development", status: "Future", active: false, icon: Code },
                { phase: "Phase 4", title: "Hardware Initiative", status: "Long-term", active: false, icon: Smartphone }
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className={`w-10 h-10 rounded-lg mb-6 flex items-center justify-center relative z-10 ${item.active ? 'bg-charcoal text-white shadow-xl' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    <item.icon size={18} />
                    {item.active && <div className="absolute inset-0 rounded-lg animate-ping bg-charcoal/20"></div>}
                  </div>
                  <h4 className={`font-black uppercase tracking-widest text-[10px] mb-1 ${item.active ? 'text-charcoal' : 'text-slate-400'}`}>{item.phase}</h4>
                  <h5 className="text-charcoal font-black text-lg mb-2">{item.title}</h5>
                  <p className="text-slate-500 text-sm font-medium">{item.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-24 grid-pattern bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <SectionTitle>Building Africa’s Technology Future</SectionTitle>
            <p className="text-xl text-slate-600 leading-relaxed mb-12 font-medium">
              Africa’s next wave of innovation will come from builders developing systems designed for real-world environments. Solid Solutions aims to contribute to this future through research, collaboration, and long-term technological development.
            </p>
            <div className="relative py-8 flex flex-col items-center">
              {/* Flowchart Container */}
              <div className="relative flex flex-col items-center w-full max-w-xl">
                
                {/* Root Node: Systems */}
                <motion.div 
                  whileHover={{ y: -3 }}
                  onClick={() => handleOpenDetail('systems')}
                  className="relative z-10 mb-12 group cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-xl bg-charcoal text-white flex items-center justify-center shadow-2xl mb-4 transition-transform group-hover:scale-105">
                      <Layers size={32} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-charcoal bg-white px-3 py-1 border border-black/10 rounded-full shadow-sm">Systems</span>
                  </div>
                  
                  {/* Vertical Stem */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-8 bg-black/10"></div>
                </motion.div>

                {/* Horizontal Branch */}
                <div className="absolute top-[125px] left-1/4 right-1/4 h-px bg-black/10"></div>
                
                {/* Children Nodes */}
                <div className="grid grid-cols-2 gap-16 md:gap-32 w-full">
                  {/* Community Node */}
                  <motion.div 
                    whileHover={{ y: -3 }}
                    onClick={() => handleOpenDetail('community')}
                    className="flex flex-col items-center relative group cursor-pointer"
                  >
                    {/* Vertical Connector */}
                    <div className="absolute -top-8 left-1/2 w-px h-8 bg-black/10"></div>
                    
                    <div className="w-14 h-14 glass-card bg-white border-black/10 flex items-center justify-center text-charcoal mb-3 group-hover:border-charcoal/20 shadow-lg">
                      <Users size={24} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-charcoal">Community</span>
                  </motion.div>
                  
                  {/* Research Node */}
                  <motion.div 
                    whileHover={{ y: -3 }}
                    onClick={() => handleOpenDetail('research')}
                    className="flex flex-col items-center relative group cursor-pointer"
                  >
                    {/* Vertical Connector */}
                    <div className="absolute -top-8 left-1/2 w-px h-8 bg-black/10"></div>
                    
                    <div className="w-14 h-14 glass-card bg-white border-black/10 flex items-center justify-center text-charcoal mb-3 group-hover:border-charcoal/20 shadow-lg">
                      <Microscope size={24} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-charcoal">Research</span>
                  </motion.div>
                </div>

                {/* Decorative Flow Indicators */}
                <div className="absolute top-[125px] left-1/4 w-1.5 h-1.5 rounded-full bg-black/10 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-[125px] right-1/4 w-1.5 h-1.5 rounded-full bg-black/10 translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <SectionTitle subtitle="Solid Solutions welcomes collaboration with developers, engineers, researchers, institutions, and investors interested in advancing Africa’s technology ecosystem.">
                Collaborate With Us
              </SectionTitle>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center text-charcoal flex-shrink-0 shadow-sm">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-charcoal font-black uppercase tracking-widest text-xs mb-1">Email</h4>
                    <p className="text-slate-600 font-bold">info@solidsolutions.africa</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center text-charcoal flex-shrink-0 shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="text-charcoal font-black uppercase tracking-widest text-xs mb-1">Location</h4>
                    <p className="text-slate-600 font-bold">Africa (Headquarters Pending)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card p-8 bg-slate-50 border-black/5 shadow-2xl">
              {formStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-charcoal font-black uppercase tracking-widest text-sm mb-2">Message Sent!</h3>
                  <p className="text-slate-600 font-medium">Thank you! We'll respond to <strong>info@solidsolutions.africa</strong> soon.</p>
                </div>
              ) : (
                <form 
                  action="https://formspree.io/f/xzdoprej" 
                  method="POST"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setFormStatus('submitting');
                    
                    const formData = new FormData(e.currentTarget);
                    
                    try {
                      const response = await fetch('https://formspree.io/f/xzdoprej', {
                        method: 'POST',
                        body: formData,
                        headers: {
                          'Accept': 'application/json'
                        }
                      });
                      
                      if (response.ok) {
                        setFormStatus('success');
                      } else {
                        setFormStatus('error');
                      }
                    } catch (error) {
                      setFormStatus('error');
                    }
                  }}
                  className="space-y-6"
                >
                  <input type="hidden" name="_to" value="info@solidsolutions.africa" />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500">Name</label>
                      <input 
                        type="text" 
                        name="name"
                        required
                        className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-charcoal/30 transition-colors font-medium shadow-sm" 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-charcoal/30 transition-colors font-medium shadow-sm" 
                        placeholder="john@example.com" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Message</label>
                    <textarea 
                      name="message"
                      rows={4} 
                      required
                      className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 text-charcoal focus:outline-none focus:border-charcoal/30 transition-colors font-medium shadow-sm" 
                      placeholder="How can we collaborate?"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full py-4 bg-charcoal text-white font-black uppercase tracking-widest text-xs rounded shadow-xl hover:shadow-black/20 transition-all disabled:opacity-50"
                  >
                    {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                  {formStatus === 'error' && (
                    <p className="text-red-600 text-xs font-bold text-center">Something went wrong. Please email info@solidsolutions.africa directly.</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-black/5 bg-bg-main">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-charcoal rounded flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white rounded-sm"></div>
                </div>
                <span className="text-lg font-black tracking-tight text-charcoal uppercase">SOLID SOLUTIONS</span>
              </div>
              <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                Developing practical technology for Africa’s digital future. An emerging initiative focused on AI, infrastructure, and hardware.
              </p>
            </div>
            <div>
              <h4 className="text-charcoal font-black uppercase text-xs tracking-widest mb-6">Explore</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-bold uppercase tracking-wider">
                <li><a href="#about" className="hover:text-charcoal transition-colors">About</a></li>
                <li><a href="#mission" className="hover:text-charcoal transition-colors">Mission</a></li>
                <li><a href="#pillars" className="hover:text-charcoal transition-colors">Research</a></li>
                <li><a href="#roadmap" className="hover:text-charcoal transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-charcoal font-black uppercase text-xs tracking-widest mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-bold uppercase tracking-wider">
                <li><button onClick={() => setActiveModal('privacy')} className="hover:text-charcoal transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setActiveModal('terms')} className="hover:text-charcoal transition-colors">Terms of Service</button></li>
                <li><a href="#contact" className="hover:text-charcoal transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Solid Solutions. All rights reserved.
            </p>
            <div className="flex gap-6 text-slate-400 font-bold uppercase tracking-widest text-[10px] items-center">
              <a href="/documentation" title="Documentation" className="flex items-center gap-2 hover:text-charcoal transition-colors"><Globe size={18} /> DOCS</a>
              <a href="/beta" title="Developer Beta" className="flex items-center gap-2 hover:text-charcoal transition-colors"><Code size={18} /> BETA</a>
              <a href="/solid-llm" title="Solid AI" className="flex items-center gap-2 hover:text-charcoal transition-colors"><Network size={18} /> SOLID AI</a>
            </div>
          </div>
        </div>
      </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-charcoal/40 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-main w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-bg-dark sticky top-0 z-10">
                <h2 className="text-xl font-bold text-white">
                  {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h2>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-slate-500 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                {activeModal === 'privacy' ? (
                  <div className="space-y-6 text-slate-400 leading-relaxed">
                    <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p>At Solid Solutions, we are committed to protecting your privacy. This short Privacy Policy outlines how we handle your information.</p>
                    
                    <h3 className="text-white font-bold text-lg mt-6 mb-2">1. Information We Collect</h3>
                    <p>We may collect basic contact information (such as your name and email address) when you voluntarily submit it through our contact forms or when you reach out to us at info@solidsolutions.africa.</p>
                    
                    <h3 className="text-white font-bold text-lg mt-6 mb-2">2. How We Use Your Information</h3>
                    <p>We use the information you provide solely to respond to your inquiries, facilitate collaboration, and keep you updated on our initiatives. We do not sell or share your personal information with third parties for marketing purposes.</p>
                    
                    <h3 className="text-white font-bold text-lg mt-6 mb-2">3. Data Security</h3>
                    <p>We implement reasonable security measures to protect your information from unauthorized access or disclosure.</p>
                    
                    <h3 className="text-white font-bold text-lg mt-6 mb-2">4. Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us at info@solidsolutions.africa.</p>
                  </div>
                ) : (
                  <div className="space-y-6 text-slate-400 leading-relaxed">
                    <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p>Welcome to Solid Solutions. By accessing our website and engaging with our initiatives, you agree to these simple Terms of Service.</p>
                    
                    <h3 className="text-white font-bold text-lg mt-6 mb-2">1. Use of Our Website</h3>
                    <p>Our website is provided for informational purposes to share our vision for Africa's technology future. You agree to use the site responsibly and not for any unlawful activities.</p>
                    
                    <h3 className="text-white font-bold text-lg mt-6 mb-2">2. Intellectual Property</h3>
                    <p>The content, design, and concepts presented on this website are the property of Solid Solutions unless otherwise noted. Please do not reproduce our materials without permission.</p>
                    
                    <h3 className="text-white font-bold text-lg mt-6 mb-2">3. Collaborations</h3>
                    <p>Any ideas, proposals, or feedback submitted to us (e.g., via info@solidsolutions.africa) are welcomed, but submission does not create a binding partnership or obligation unless explicitly agreed upon in writing.</p>
                    
                    <h3 className="text-white font-bold text-lg mt-6 mb-2">4. Limitation of Liability</h3>
                    <p>Solid Solutions provides this website "as is" and makes no warranties regarding its completeness or accuracy. We are not liable for any damages arising from your use of the site.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
