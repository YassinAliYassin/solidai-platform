import { useState } from "react";
import { MessageSquare, Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// OpenRouter API configuration
const OPENROUTER_API_KEY = ''; // Users can set their own via Settings panel
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-sonnet-4';

// Sector prompts for African contexts
const SECTOR_PROMPTS = {
  agriculture: "You are an agricultural expert focused on African farming. Provide practical advice on crop selection, soil management, pest control, irrigation, and sustainable farming practices suitable for African climates and small-scale farmers. Consider local challenges like drought, limited resources, and access to markets.",
  health: "You are a healthcare advisor for African clinics and communities. Provide guidance on preventive care, common diseases (malaria, HIV/AIDS, TB), maternal/child health, nutrition, and accessing healthcare in resource-limited settings. Emphasize community health workers and local resources.",
  education: "You are an education specialist for African schools and learning centers. Advise on curriculum development, teacher training, digital literacy, infrastructure challenges, multilingual education, and innovative solutions for reaching remote or underserved students.",
  finance: "You are a fintech advisor for African markets. Explain mobile money (M-Pesa, etc.), microfinance, savings groups, digital payments, credit access, and financial inclusion strategies. Focus on serving the unbanked and underbanked populations.",
  legal: "You are a legal advisor for African contexts. Provide guidance on land rights, business registration, contract law, dispute resolution, women's rights, and accessing justice in systems with limited legal aid. Reference customary law where relevant.",
  transport: "You are a transportation and logistics expert for Africa. Advise on last-mile delivery, public transit in growing cities, rural road access, supply chain challenges, cross-border transport, and leveraging motorcycles/bicycles for transport.",
  energy: "You are a renewable energy advisor for Africa. Focus on off-grid solar, mini-grids, clean cooking solutions, energy access for rural areas, pay-as-you-go models, and sustainable energy for productive uses (irrigation, milling, etc.)."
};

const SECTORS = Object.keys(SECTOR_PROMPTS);

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: 'Hello! I\'m SolidAI, your African sector advisor. Select a sector below and ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [selectedSector, setSelectedSector] = useState('agriculture');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openrouter_key') || '');

  const callOpenRouter = async (message: string, sector: string) => {
    const key = localStorage.getItem('openrouter_key') || OPENROUTER_API_KEY;
    
    if (!key) {
      throw new Error('No API key configured. Please add your OpenRouter API key in Settings.');
    }

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://solidai.solidsolutions.africa',
        'X-Title': 'SolidAI',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SECTOR_PROMPTS[sector] },
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const getMockResponse = (sector: string, message: string) => {
    const mockResponses = {
      agriculture: `🌾 **Agriculture Advisor (Mock)**\n\nThank you for your question about "${message}". In a full deployment, I would provide tailored advice on African farming practices, crop selection for your climate, soil management techniques, and sustainable irrigation solutions.\n\n💡 (Mock response — add OpenRouter API key for real AI)`,
      health: `🏥 **Health Advisor (Mock)**\n\nRegarding "${message}" — I would normally provide guidance on preventive care, common health challenges in African communities, and strategies for accessing healthcare in resource-limited settings.\n\n💡 (Mock response — add OpenRouter API key for real AI)`,
      education: `📚 **Education Advisor (Mock)**\n\nFor "${message}" — I would advise on curriculum development, teacher training strategies, digital literacy programs, and innovative solutions for reaching remote students.\n\n💡 (Mock response — add OpenRouter API key for real AI)`,
      finance: `💰 **Finance Advisor (Mock)**\n\nAbout "${message}" — I would explain mobile money solutions, microfinance options, savings group strategies, and financial inclusion approaches for unbanked populations.\n\n💡 (Mock response — add OpenRouter API key for real AI)`,
      legal: `⚖️ **Legal Advisor (Mock)**\n\nRegarding "${message}" — I would provide guidance on land rights, business registration, contract basics, and accessing justice through community-based mechanisms.\n\n💡 (Mock response — add OpenRouter API key for real AI)`,
      transport: `🚗 **Transport Advisor (Mock)**\n\nFor "${message}" — I would advise on last-mile delivery solutions, public transit planning, rural accessibility challenges, and leveraging local transport modes effectively.\n\n💡 (Mock response — add OpenRouter API key for real AI)`,
      energy: `⚡ **Energy Advisor (Mock)**\n\nAbout "${message}" — I would focus on off-grid solar solutions, mini-grid development, clean cooking alternatives, and pay-as-you-go energy access models.\n\n💡 (Mock response — add OpenRouter API key for real AI)`
    };
    return mockResponses[sector] || mockResponses.agriculture;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await callOpenRouter(userMessage, selectedSector);
      setMessages(prev => [...prev, { role: 'bot', content: aiResponse }]);
    } catch (error) {
      console.warn('OpenRouter API failed, using mock:', error);
      const mockResponse = getMockResponse(selectedSector, userMessage);
      setMessages(prev => [...prev, { role: 'bot', content: mockResponse }]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openrouter_key', apiKey.trim());
    } else {
      localStorage.removeItem('openrouter_key');
    }
    setShowSettings(false);
  };

  const hasApiKey = () => {
    return !!(localStorage.getItem('openrouter_key') || OPENROUTER_API_KEY);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-charcoal text-white shadow-lg flex items-center justify-center"
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-charcoal text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">SolidAI Assistant</h3>
                <p className="text-xs text-white/70">
                  {hasApiKey() ? '✅ AI Ready' : '⚠️ Mock Mode (Add API Key)'}
                </p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Settings size={18} />
              </button>
            </div>

            {/* Sector Selector */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-charcoal"
              >
                {SECTORS.map(sector => (
                  <option key={sector} value={sector}>
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-charcoal text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-700 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-700 rounded-lg rounded-bl-none p-3 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-charcoal disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center z-60"
                  onClick={() => setShowSettings(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white rounded-2xl p-6 w-80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-lg">Settings</h4>
                      <button onClick={() => setShowSettings(false)}>
                        <X size={20} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          OpenRouter API Key
                        </label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="sk-or-v1-..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-charcoal"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Get your key at openrouter.ai
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveApiKey}
                          className="flex-1 px-4 py-2 bg-charcoal text-white rounded-lg text-sm hover:bg-slate-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setApiKey(''); localStorage.removeItem('openrouter_key'); setShowSettings(false); }}
                          className="px-14 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
