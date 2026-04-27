import { useState, useRef, useEffect } from 'react';
import api from '../api/client';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Wanderlust assistant. Ask me to find a stay, compare options, or plan a trip." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setSending(true);

    try {
      const { data } = await api.post('/ai/chat', { messages: next });
      setMessages([...next, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages([
        ...next,
        { role: 'assistant', content: 'Sorry, I had trouble reaching the AI service. Please try again.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        className="chatbot-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? '×' : '💬'}
      </button>

      {open && (
        <div className="chatbot-panel">
          <header className="chatbot-header">
            <strong>Wanderlust Assistant</strong>
            <span className="badge">AI</span>
          </header>
          <div className="chatbot-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>{m.content}</div>
            ))}
            {sending && <div className="bubble assistant typing">…</div>}
          </div>
          <form onSubmit={send} className="chatbot-input">
            <input
              type="text"
              placeholder="Ask about stays, prices, places…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}
