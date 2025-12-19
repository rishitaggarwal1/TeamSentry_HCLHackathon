// Widget.jsx
import React, { useState, useRef, useEffect } from "react";
// ✅ Professional Import: Using the official library
import { X, Send, Heart } from "lucide-react";

export default function Widget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "🏥 Hi! I'm your First Aid Assistant. Describe your injury or symptom and I'll help you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const formattedResponse = `**Detected: ${data.predicted_topic}**\n\n${data.bot_response}`;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: formattedResponse,
          topic: data.predicted_topic,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ Could not reach the hospital server. Please make sure the backend is running on http://127.0.0.1:8000",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            marginBottom: "16px",
            width: "384px",
            height: "550px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(to right, #dc2626, #b91c1c)",
              color: "white",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Heart size={20} fill="white" color="white" />
              </div>
              <div>
                <h3 style={{ fontWeight: "600", margin: 0 }}>
                  First Aid Assistant
                </h3>
                <p style={{ fontSize: "12px", color: "#fecaca", margin: 0 }}>
                  🟢 Online • Ready to help
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                border: "none",
                padding: "8px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "white",
              }}
            >
              <X size={20} color="white" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              background: "linear-gradient(to bottom, #f9fafb, white)",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    borderRadius: "16px",
                    padding: "12px",
                    backgroundColor: msg.role === "user" ? "#dc2626" : "white",
                    color: msg.role === "user" ? "white" : "#1f2937",
                    boxShadow:
                      msg.role === "assistant"
                        ? "0 1px 3px rgba(0,0,0,0.1)"
                        : "none",
                    border:
                      msg.role === "assistant" ? "1px solid #f3f4f6" : "none",
                    borderBottomRightRadius:
                      msg.role === "user" ? "4px" : "16px",
                    borderBottomLeftRadius:
                      msg.role === "assistant" ? "4px" : "16px",
                  }}
                >
                  {msg.role === "assistant" && msg.topic && (
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#dc2626",
                        marginBottom: "8px",
                        paddingBottom: "8px",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      📋 Topic: {msg.topic}
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: "14px",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {msg.content.replace(/\*\*.*?\*\*\n\n/, "")}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    borderBottomLeftRadius: "4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #f3f4f6",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginRight: "8px",
                      }}
                    >
                      Analyzing
                    </span>
                    {/* Bouncing dots animation */}
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div
                        key={i}
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "#fca5a5",
                          borderRadius: "50%",
                          animation: `bounce 1s infinite ${delay}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div
              style={{
                padding: "0 16px 8px",
                display: "flex",
                gap: "8px",
                overflowX: "auto",
              }}
            >
              {["Cut on finger", "Snake bite", "Burn injury", "Headache"].map(
                (suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    style={{
                      fontSize: "12px",
                      padding: "6px 12px",
                      backgroundColor: "#fef2f2",
                      color: "#b91c1c",
                      borderRadius: "20px",
                      whiteSpace: "nowrap",
                      border: "1px solid #fecaca",
                      cursor: "pointer",
                    }}
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          )}

          {/* Input Area */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "white",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your symptom..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  padding: "10px",
                  borderRadius: "12px",
                  border: "none",
                  cursor:
                    isLoading || !input.trim() ? "not-allowed" : "pointer",
                  opacity: isLoading || !input.trim() ? 0.5 : 1,
                }}
              >
                <Send size={20} color="white" />
              </button>
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "#6b7280",
                marginTop: "8px",
                textAlign: "center",
                margin: "8px 0 0 0",
              }}
            >
              ⚠️ For emergencies, call your local emergency number
            </p>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "linear-gradient(to bottom right, #dc2626, #b91c1c)",
          color: "white",
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isOpen ? (
          <X size={28} color="white" />
        ) : (
          <>
            <Heart size={28} fill="white" color="white" />
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "16px",
                height: "16px",
                backgroundColor: "#22c55e",
                borderRadius: "50%",
                border: "2px solid white",
              }}
            ></span>
          </>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
