import { useState, useRef, useEffect } from 'react';
import { api } from '../../lib/api-client';
import { useAuth } from '../../providers/AuthProvider';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'What is double materiality?',
  'Explain ESRS E1 Climate Change requirements',
  'What are the CSRD reporting timelines?',
  'How do I calculate Scope 3 emissions?',
  'What is the EU Taxonomy alignment?',
];

export function AiCopilot() {
  const { tenant } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text?: string) {
    const question = text || input;
    if (!question.trim()) return;

    const userMsg: Message = { role: 'user', content: question, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api<{ data: { text: string } }>('/ai/chat', {
        method: 'POST',
        body: { question },
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.text, timestamp: new Date() }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  if (!tenant) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-xl font-bold transition-all z-50 ${
          open ? 'bg-slate-700 hover:bg-slate-800 rotate-45' : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'
        }`}
      >
        {open ? '+' : 'AI'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">AI</span>
            <div>
              <div className="text-sm font-semibold">ESG Copilot</div>
              <div className="text-[10px] text-slate-400">Powered by OpenAI</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-slate-500 mb-3">Ask me anything about ESRS, CSRD, or ESG reporting.</p>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="block w-full text-left px-3 py-2 text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors text-slate-600">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-2 rounded-xl rounded-bl-sm text-sm text-slate-400">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
                placeholder="Ask about ESRS, CSRD, ESG..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-40">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
