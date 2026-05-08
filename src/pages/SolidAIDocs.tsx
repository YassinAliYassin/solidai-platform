import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SolidAIDocs() {
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string, id: string }) => (
    <div className="relative group">
      <pre className="bg-[#1a1a2e] rounded-xl p-6 overflow-x-auto border border-white/10">
        <code className="text-sm text-gray-300 font-mono">{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-4 right-4 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition opacity-0 group-hover:opacity-100"
      >
        {copiedCode === id ? '✓ Copied!' : 'Copy'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">{'</>'}</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">SolidAI</span>
            <span className="text-sm text-gray-400 ml-2">| API Docs</span>
          </div>
          <a href="/solidai" className="text-sm text-gray-400 hover:text-white transition">← Back to Platform</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600/30 rounded-full text-sm text-blue-400 mb-6">
            <span>📚</span>
            <span>API Documentation</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SolidAI API
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Build intelligent applications with state-of-the-art language models. 
            REST API with SDKs for Python, Node.js, and Go.
          </p>
        </motion.div>

        {/* Quick Start */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="text-blue-400">🚀</span>
            Quick Start
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-yellow-400">🔑</span>
                Step 1: Get API Key
              </h3>
              <p className="text-gray-400 mb-4">Sign up at SolidAI and get your API key from the dashboard.</p>
              <CodeBlock
                id="api-key"
                code={`curl -X POST https://api.solidai.africa/v1/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{"email": "your@email.com", "password": "secure_pass"}'`}
              />
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-green-400">🎯</span>
                Step 2: Make Your First Call
              </h3>
              <p className="text-gray-400 mb-4">Test the API with a simple completion request.</p>
              <CodeBlock
                id="first-call"
                code={`curl https://api.solidai.africa/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "solidai-7b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
              />
            </div>
          </div>
        </motion.section>

        {/* SDK Examples */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-8">SDK Examples</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-400">🐍</span>
                Python
              </h3>
              <CodeBlock
                id="python-example"
                code={`import solidai

client = solidai.SolidAI(api_key="YOUR_API_KEY")

response = client.chat.completions.create(
    model="solidai-7b",
    messages=[
        {"role": "user", "content": "Explain AI in Africa"}
    ]
)

print(response.choices[0].message.content)`}
              />
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-green-400">🟢</span>
                Node.js
              </h3>
              <CodeBlock
                id="node-example"
                code={`const SolidAI = require('solidai-node');

const client = new SolidAI('YOUR_API_KEY');

const response = await client.chat.completions.create({
  model: 'solidai-7b',
  messages: [
    { role: 'user', content: 'Explain AI in Africa' }
  ]
});

console.log(response.choices[0].message.content);`}
              />
            </div>
          </div>
        </motion.section>

        {/* Models */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-8">Available Models</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'solidai-7b', desc: 'Fast, efficient model for simple tasks', latency: '<20ms', context: '32k' },
              { name: 'solidai-13b', desc: 'Balanced performance and speed', latency: '<35ms', context: '64k' },
              { name: 'solidai-70b', desc: 'Most capable model for complex tasks', latency: '<50ms', context: '128k' }
            ].map((model, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{model.name}</h3>
                  <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{model.desc}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Latency</span>
                    <span className="text-blue-400">{model.latency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Context</span>
                    <span className="text-purple-400">{model.context}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center glass-card p-12 rounded-3xl border border-white/10"
        >
          <div className="text-5xl mb-6">✅</div>
          <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join 10,000+ developers building with SolidAI. Start with 1,000 free API calls.
          </p>
          <a
            href="/solidai"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold transition shadow-lg shadow-blue-600/25"
          >
            Create Free Account
            <span>🚀</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
