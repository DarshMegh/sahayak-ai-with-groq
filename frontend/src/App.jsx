import { useState } from "react";
import "./App.css";

// APNA IP DAALO YAHAN (cmd mein ipconfig chalao)
const BACKEND_URL = " https://sahayak-ai-with-groq.onrender.com/chat";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (customMessage = null) => {
    const finalMessage = customMessage || input;
    if (!finalMessage.trim()) return;

    setLoading(true);
    let botReply = "";

    if (finalMessage.toLowerCase().includes("open youtube")) {
      window.open("https://youtube.com", "_blank");
      botReply = "Opening YouTube...";
    } else if (finalMessage.toLowerCase().includes("play music")) {
      window.open("https://music.youtube.com", "_blank");
      botReply = "Opening Music Player...";
    } else if (finalMessage.toLowerCase().includes("set reminder")) {
      botReply = "Reminder feature activated.";
    } else {
      try {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: finalMessage }),
        });
        const data = await response.json();
        botReply = data.response;
      } catch (error) {
        botReply = "Unable to connect with AI server.";
      }
    }

    setMessages((prev) => [
      ...prev,
      { sender: "You", text: finalMessage },
      { sender: "Sahayak AI", text: botReply },
    ]);
    setInput("");
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
      <div className="app">
        <h1 className="title">SAHAYAK AI</h1>
        <div className="chat-box">
          {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === "You" ? "user" : "bot"}`}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
          ))}
          {loading && <div className="message bot"><em>Sahayak AI soch raha hai...</em></div>}
        </div>
        <div className="input-section">
          <input
              type="text"
              placeholder="Talk with Sahayak..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
          />
          <button onClick={() => sendMessage()}>Send</button>
        </div>
        <div className="buttons">
          <button className="feature-btn" onClick={() => sendMessage("open youtube")}>Open YouTube</button>
          <button className="feature-btn" onClick={() => sendMessage("play music")}>Play Music</button>
          <button className="feature-btn" onClick={() => sendMessage("set reminder")}>Set Reminder</button>
        </div>
      </div>
  );
}

export default App;