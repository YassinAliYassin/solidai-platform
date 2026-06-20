import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBrain,
  faRocket,
  faShieldAlt,
  faCode,
  faChartLine,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import AgentStatusBadge from '../components/solidai/AgentStatusBadge';
import TaskProgressBar from '../components/solidai/TaskProgressBar';
import QuickAgentSwitcher from '../components/solidai/QuickAgentSwitcher';
import { ChatBot } from '../components/ChatBot';

export default function SolidAI() {
  const heroRef = useRef(null);

  const features = [
    {
      icon: faBrain,
      title: 'Advanced AI Models',
      desc: 'State-of-the-art language models trained on diverse datasets for African contexts and global applications.'
    },
    {
      icon: faRocket,
      title: 'Lightning Fast',
      desc: 'Optimized inference with <50ms latency. Built on high-performance infrastructure across Africa.'
    },
    {
      icon: faShieldAlt,
      title: 'Enterprise Security',
      desc: 'SOC 2 compliant with end-to-end encryption. Your data never leaves your control.'
    },
    {
      icon: faCode,
      title: 'Developer First',
      desc: 'RESTful APIs, SDKs for Python/Node/Go, and comprehensive docs with live playground.'
    },
    {
      icon: faChartLine,
      title: 'Scalable Infrastructure',
      desc: 'Auto-scaling clusters across 3 regions. Handle millions of requests with 99.9% uptime.'
    },
    {
      icon: faUsers,
      title: 'Team Collaboration',
      desc: 'Shared workspaces, role-based access, and usage analytics for teams of any size.'
    }
  ];

  const agents = [
    { id: 'agriculture', name: 'Agriculture Agent' },
    { id: 'health', name: 'Health Agent' },
    { id: 'education', name: 'Education Agent' },
    { id: 'finance', name: 'Finance Agent' },
  ];

  const [selectedAgent, setSelectedAgent] = useState('agriculture');
  const [progress, setProgress] = useState(65);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faBrain} className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold gradient-text">SolidAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition">Pricing</a>
            <a href="#docs" className="text-sm text-gray-300 hover:text-white transition">Docs</a>
            <a href="#about" className="text-sm text-gray-300 hover:text-white transition">About</a>
          </div>
          <button className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm font-medium transition">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Now in Public Beta
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The Future of AI in<br />
              <span className="gradient-text">Africa & Beyond</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Build intelligent applications with SolidAI's powerful language models.
              Designed for developers, trusted by enterprises, built for scale.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold transition glow">
                Start Building Free
              </button>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-lg font-semibold transition">
                View Documentation
              </button>
            </div>

            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faRocket} />
                <span>{'<50ms'} Latency</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} />
                <span>10k+ Developers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Built for <span className="gradient-text">Modern AI</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to integrate cutting-edge AI into your applications
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={feature.icon} className="text-blue-400 text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Demo Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Try <span className="gradient-text">SolidAI Agents</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience our sector-specific AI agents in action
            </p>
          </motion.div>

          <div className="glass-card rounded-2xl p-8 space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Agent Status</h3>
              <div className="flex flex-wrap gap-6">
                <AgentStatusBadge status="online" agentName="Agriculture Agent" />
                <AgentStatusBadge status="busy" agentName="Health Agent" />
                <AgentStatusBadge status="online" agentName="Education Agent" />
                <AgentStatusBadge status="offline" agentName="Finance Agent" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Task Progress</h3>
              <div className="space-y-4 max-w-2xl">
                <TaskProgressBar taskName="Processing farm data" progress={progress} status="active" />
                <TaskProgressBar taskName="Generating health report" progress={100} status="completed" />
                <TaskProgressBar taskName="Analyzing education patterns" progress={45} status="active" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Switch Agent</h3>
              <QuickAgentSwitcher
                agents={agents}
                selectedAgentId={selectedAgent}
                onSelect={setSelectedAgent}
              />
              <p className="text-sm text-gray-400 mt-2">
                Currently selected: {agents.find(a => a.id === selectedAgent)?.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ChatBot Component */}
      <ChatBot />

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 glow"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to build the <span className="gradient-text">future</span>?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of developers already building with SolidAI.
              Start with 1000 free API calls.
            </p>
            <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold transition glow">
              Create Free Account
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                <FontAwesomeIcon icon={faBrain} className="text-white text-xs" />
              </div>
              <span className="font-bold gradient-text">SolidAI</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 Solid Solutions. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition">Privacy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition">Terms</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
