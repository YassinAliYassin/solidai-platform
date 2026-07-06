import { useState } from 'react'
import './index.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState("anthropic/claude-sonnet-4")

  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: input })
      })
      
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Error' }])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-600">
            Solid<span className="text-primary">Cloud</span> AI Hub
          </h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4">
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="anthropic/claude-sonnet-4">Claude Sonnet 4</option>
            <option value="openai/gpt-4o">GPT-4o</option>
            <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
            <option value="xai/grok-2">Grok 2</option>
          </select>
        </div>
        
        <div className="bg-white rounded-lg shadow h-96 overflow-y-auto p-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-4 py-2 rounded-lg ${
                msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-400">Thinking...</div>}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-2 border rounded-lg"
            placeholder="Ask anything..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
