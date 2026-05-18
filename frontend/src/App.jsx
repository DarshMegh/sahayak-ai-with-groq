import { useState, useEffect, useRef } from "react";
import "./App.css";

const BACKEND_URL = "https://sahayak-ai-with-groq.onrender.com/chat";

// ─── Smart Action Detector ───────────────────────────────────────────────────
function detectAction(text) {
  const t = text.toLowerCase().trim();

  // WhatsApp
  const waMatch = t.match(/(?:open whatsapp|send whatsapp|whatsapp)(?:\s+to\s+([\w\s]+?))?(?:\s+(?:and\s+)?(?:say|send|message|text)\s+["']?(.+?)["']?)?$/i)
      || text.match(/whatsapp\s+([\w\s]+?)\s+(?:ko|to)\s+(?:bhejo|send|bol)\s+["']?(.+?)["']?/i);
  if (waMatch || t.includes("whatsapp")) {
    const phone = "";
    const msg = waMatch?.[2] || "";
    return { type: "whatsapp", phone, msg };
  }

  // Call
  const callMatch = t.match(/(?:call|phone|dial)\s+([\d\s\+\-]+)/i)
      || t.match(/(?:call karo|call karna|phone karo)\s+([\d\s\+\-]+)/i);
  if (callMatch) return { type: "call", number: callMatch[1].trim() };

  // Email
  const emailMatch = t.match(/(?:send email|email|mail)\s+(?:to\s+)?([\w.@]+)\s+(?:saying|with|message|about)?\s*["']?(.+?)["']?$/i);
  if (emailMatch) return { type: "email", to: emailMatch[1], subject: emailMatch[2] };

  // Google Search
  const searchMatch = t.match(/(?:search|google|find|look up)\s+(?:for\s+)?["']?(.+?)["']?$/i)
      || t.match(/(?:search karo|dhundho|google karo)\s+["']?(.+?)["']?$/i);
  if (searchMatch) return { type: "search", query: searchMatch[1] };

  // Maps / Navigate
  const mapsMatch = t.match(/(?:navigate to|directions to|open maps|show map of|maps)\s+["']?(.+?)["']?$/i)
      || t.match(/(?:raasta|navigate|maps)\s+["']?(.+?)["']?$/i);
  if (mapsMatch) return { type: "maps", place: mapsMatch[1] };

  // Reminder
  const reminderMatch = t.match(/(?:remind me|set reminder|reminder)\s+(?:to\s+)?(.+?)(?:\s+in\s+(\d+)\s*(minute|min|hour|hr|second|sec)s?)?$/i)
      || t.match(/(?:yaad dilao|reminder)\s+(.+?)(?:\s+(\d+)\s*(minute|min|hour|hr))?/i);
  if (reminderMatch) {
    const amount = parseInt(reminderMatch[2]) || 1;
    const unit = reminderMatch[3]?.toLowerCase() || "minute";
    let ms = amount * 60000;
    if (unit.startsWith("hour") || unit.startsWith("hr")) ms = amount * 3600000;
    if (unit.startsWith("sec")) ms = amount * 1000;
    return { type: "reminder", task: reminderMatch[1], ms };
  }

  // YouTube
  if (t.includes("youtube") || t.includes("open youtube"))
    return { type: "youtube" };

  // Music
  if (t.includes("play music") || t.includes("music chalao") || t.includes("open music"))
    return { type: "music" };

  return null;
}

// ─── Execute Actions ──────────────────────────────────────────────────────────
function executeAction(action, setMessages, speakText, requestNotifPerm) {
  switch (action.type) {
    case "whatsapp": {
      const url = action.phone
          ? `https://wa.me/${action.phone.replace(/\D/g, "")}?text=${encodeURIComponent(action.msg)}`
          : `https://wa.me/?text=${encodeURIComponent(action.msg || "Hello!")}`;
      window.open(url, "_blank");
      const reply = action.msg
          ? `✅ WhatsApp open ho raha hai with message: "${action.msg}"`
          : "✅ WhatsApp open ho raha hai!";
      setMessages(p => [...p, { sender: "ai", text: reply }]);
      speakText(reply);
      return true;
    }
    case "call": {
      window.location.href = `tel:${action.number}`;
      const reply = `📞 Calling ${action.number}...`;
      setMessages(p => [...p, { sender: "ai", text: reply }]);
      speakText(reply);
      return true;
    }
    case "email": {
      window.location.href = `mailto:${action.to}?subject=${encodeURIComponent(action.subject || "Hello")}&body=${encodeURIComponent(action.subject || "")}`;
      const reply = `📧 Email compose ho raha hai to ${action.to}`;
      setMessages(p => [...p, { sender: "ai", text: reply }]);
      speakText(reply);
      return true;
    }
    case "search": {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(action.query)}`, "_blank");
      const reply = `🔍 Searching Google for: "${action.query}"`;
      setMessages(p => [...p, { sender: "ai", text: reply }]);
      speakText(reply);
      return true;
    }
    case "maps": {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(action.place)}`, "_blank");
      const reply = `🗺️ Opening Google Maps for: "${action.place}"`;
      setMessages(p => [...p, { sender: "ai", text: reply }]);
      speakText(reply);
      return true;
    }
    case "reminder": {
      requestNotifPerm().then(granted => {
        const reply = granted
            ? `⏰ Reminder set! "${action.task}" — ${action.ms / 60000 < 1 ? action.ms / 1000 + "s" : Math.round(action.ms / 60000) + " min"} mein yaad dilaunga!`
            : `⏰ Reminder set for "${action.task}" (notifications blocked — please allow)`;
        setMessages(p => [...p, { sender: "ai", text: reply }]);
        speakText(reply);
        setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification("⏰ Sahayak AI Reminder", { body: action.task, icon: "/vite.svg" });
          }
          speakText(`Reminder! ${action.task}`);
        }, action.ms);
      });
      return true;
    }
    case "youtube": {
      window.open("https://youtube.com", "_blank");
      const reply = "▶️ Opening YouTube!";
      setMessages(p => [...p, { sender: "ai", text: reply }]);
      speakText(reply);
      return true;
    }
    case "music": {
      window.open("https://music.youtube.com", "_blank");
      const reply = "🎵 Opening YouTube Music!";
      setMessages(p => [...p, { sender: "ai", text: reply }]);
      speakText(reply);
      return true;
    }
    default: return false;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Namaste! 🙏 Main Sahayak AI hun.\n\nMain yeh kar sakta hun:\n📱 WhatsApp open karna\n📞 Call karna\n📧 Email bhejna\n🔍 Google search\n🗺️ Maps navigate\n⏰ Reminder set karna\n\nBas boliye!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [time, setTime] = useState(new Date());
  const [voices, setVoices] = useState([]);
  const [particles] = useState(() => Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1, delay: Math.random() * 4, duration: Math.random() * 6 + 6,
  })));
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const load = () => { const v = window.speechSynthesis.getVoices(); if (v.length) setVoices(v); };
    load(); window.speechSynthesis.onvoiceschanged = load;
  }, []);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const getBestVoice = () => {
    const preferred = ["Google UK English Female", "Samantha", "Victoria", "Karen", "Moira", "Google US English"];
    for (const name of preferred) { const v = voices.find(v => v.name.includes(name)); if (v) return v; }
    return voices.find(v => v.lang.startsWith("en")) || null;
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text.replace(/[🙏📱📞📧🔍🗺️⏰▶️🎵✅⚠️]/g, "").slice(0, 300));
    utt.lang = "en-IN"; utt.rate = 0.92; utt.pitch = 1.15;
    const voice = getBestVoice(); if (voice) utt.voice = voice;
    window.speechSynthesis.speak(utt);
  };

  const requestNotifPerm = () => {
    if (!("Notification" in window)) return Promise.resolve(false);
    if (Notification.permission === "granted") return Promise.resolve(true);
    return Notification.requestPermission().then(p => p === "granted");
  };

  const sendMessage = async (msg) => {
    const text = (msg || input).trim();
    if (!text || loading) return;
    setMessages(p => [...p, { sender: "you", text }]);
    setInput("");

    // Check for smart action first
    const action = detectAction(text);
    if (action) {
      const handled = executeAction(action, setMessages, speakText, requestNotifPerm);
      if (handled) return;
    }

    setLoading(true);
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(p => [...p, { sender: "ai", text: data.response }]);
      speakText(data.response);
    } catch {
      setMessages(p => [...p, { sender: "ai", text: "⚠️ Server se connect nahi ho pa raha." }]);
    }
    setLoading(false);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome for voice support"); return; }
    const rec = new SR();
    rec.lang = "en-IN"; rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); sendMessage(t); };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec; rec.start();
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setListening(false); };

  const quickActions = [
    { icon: "📱", label: "WhatsApp", msg: "Open WhatsApp" },
    { icon: "▶️", label: "YouTube", msg: "Open YouTube" },
    { icon: "🎵", label: "Music", msg: "Play music" },
    { icon: "🔍", label: "Search", msg: "Search for latest AI news" },
    { icon: "🗺️", label: "Maps", msg: "Navigate to Taj Mahal Agra" },
    { icon: "⏰", label: "Reminder", msg: "Remind me to drink water in 5 minutes" },
    { icon: "📞", label: "Call", msg: "Call " },
    { icon: "📧", label: "Email", msg: "Send email to " },
    { icon: "😂", label: "Joke", msg: "Tell me a funny joke" },
    { icon: "✨", label: "Motivate", msg: "Give me powerful motivation for today" },
  ];

  const pad = n => String(n).padStart(2, "0");
  const clockStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
      <div className="shell">
        <div className="particles" aria-hidden>
          {particles.map(p => (
              <div key={p.id} className="particle" style={{
                left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
                animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
              }} />
          ))}
        </div>
        <div className="grid-overlay" aria-hidden />

        <header className="header">
          <div className="header-brand">
            <div className="orb">
              <div className="orb-inner">S</div>
              <div className="orb-ring" />
            </div>
            <div>
              <div className="brand-name">SAHAYAK AI</div>
              <div className="brand-sub"><span className="live-dot" />Powered by Groq · Live</div>
            </div>
          </div>
          <div className="clock-box">
            <div className="clock-time">{clockStr}</div>
            <div className="clock-date">{dateStr}</div>
          </div>
        </header>

        <div className="quick-strip">
          {quickActions.map((q, i) => (
              <button key={i} className="quick-chip" onClick={() => sendMessage(q.msg)}>
                <span>{q.icon}</span><span>{q.label}</span>
              </button>
          ))}
        </div>

        <main className="messages">
          {messages.map((m, i) => (
              <div key={i} className={`row ${m.sender}`}>
                {m.sender === "ai" && <div className="msg-avatar">S</div>}
                <div className={`msg-bubble ${m.sender}`} style={{ whiteSpace: "pre-line" }}>{m.text}</div>
                {m.sender === "you" && <div className="msg-avatar you-av">U</div>}
              </div>
          ))}
          {loading && (
              <div className="row ai">
                <div className="msg-avatar">S</div>
                <div className="msg-bubble ai typing-bubble">
                  <span className="dot1" /><span className="dot2" /><span className="dot3" />
                </div>
              </div>
          )}
          <div ref={bottomRef} />
        </main>

        <footer className="input-zone">
          <div className="input-glow-wrap">
          <textarea
              className="input-tx"
              placeholder='Try: "Open WhatsApp and say Hello" or "Remind me in 5 minutes"'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={1}
          />
            <div className="input-actions">
              <button className={`voice-btn ${listening ? "listening" : ""}`}
                      onClick={listening ? stopVoice : startVoice} title={listening ? "Stop" : "Speak"}>
                {listening ? "⏹" : "🎤"}
              </button>
              <button className="send-btn" onClick={() => sendMessage()} disabled={loading}>➤</button>
            </div>
          </div>
          {listening && (
              <div className="voice-indicator">
                <span className="vi-dot" /><span className="vi-dot" /><span className="vi-dot" />
                Listening... speak now
              </div>
          )}
        </footer>
      </div>
  );
}