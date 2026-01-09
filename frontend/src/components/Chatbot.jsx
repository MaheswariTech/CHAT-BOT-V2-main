import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, X, Bot, User, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "### Vanakam! 👋 \nWelcome to the **MIET AI Support**. I'm here to help you navigate campus life, courses, and admissions. \n\n*How can I assist you today?*", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('chatbot_session_id');
    const lastActivity = localStorage.getItem('chatbot_last_activity');
    const currentTime = Date.now();
    const twoMinutes = 120000;

    // Check for inactivity even on page reload
    if (storedSessionId && lastActivity && (currentTime - parseInt(lastActivity) > twoMinutes)) {
      console.log("Session expired due to persistent inactivity check.");
      localStorage.removeItem('chatbot_session_id');
      localStorage.removeItem('chatbot_messages');
      localStorage.removeItem('chatbot_last_activity');
      storedSessionId = null;
    }

    if (!storedSessionId) {
      storedSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chatbot_session_id', storedSessionId);
      localStorage.setItem('chatbot_last_activity', currentTime.toString());
    }
    setSessionId(storedSessionId);

    // Periodically check server status
    const checkStatus = async () => {
      try {
        await axios.get('http://localhost:8000/status');
        setIsConnected(true);
      } catch (e) {
        setIsConnected(false);
      }
    };
    checkStatus();
    const statusInterval = setInterval(checkStatus, 30000); // Check every 30s

    // Load message history
    const savedMessages = localStorage.getItem('chatbot_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to load saved messages", e);
      }
    }
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 1) { // Don't save if only initial message
      localStorage.setItem('chatbot_messages', JSON.stringify(messages));
      localStorage.setItem('chatbot_last_activity', Date.now().toString());
    }
  }, [messages]);

  // Inactivity timeout handler
  const resetSession = () => {
    const newSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    localStorage.setItem('chatbot_session_id', newSessionId);
    localStorage.setItem('chatbot_last_activity', Date.now().toString());
    const initialMessage = {
      text: "### Vanakam! 👋 \nWelcome to the **MIET AI Support**. I'm here to help you navigate campus life, courses, and admissions. \n\n*How can I assist you today?*",
      sender: 'bot'
    };
    setMessages([initialMessage]);
    localStorage.setItem('chatbot_messages', JSON.stringify([initialMessage]));
  };

  const startInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      console.log("Inactivity timeout reached. Resetting session.");
      resetSession();
    }, 120000); // 2 minutes
  };

  useEffect(() => {
    if (isOpen) {
      // Re-validate expiration on opening the chat window
      const lastActivity = localStorage.getItem('chatbot_last_activity');
      const currentTime = Date.now();
      if (lastActivity && (currentTime - parseInt(lastActivity) > 120000)) {
        console.log("Session expired while chat was closed.");
        resetSession();
      } else {
        startInactivityTimer();
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Reset inactivity timer on interaction
    startInactivityTimer();

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        query: input,
        session_id: sessionId
      });

      // Simulate a small "thinking" delay for a more human feel
      setTimeout(() => {
        const botMessage = { text: response.data.answer, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
        setLoading(false);
        // Update activity after bot response to keep session alive during bot thinking
        localStorage.setItem('chatbot_last_activity', Date.now().toString());
        startInactivityTimer();
      }, 500);

    } catch (error) {
      console.error("Error sending message:", error);
      setTimeout(() => {
        const errorMessage = { text: "I'm having a little trouble connecting to my brain! Please check your internet or try again in a moment.", sender: 'bot' };
        setMessages(prev => [...prev, errorMessage]);
        setLoading(false);
      }, 500);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      const newSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);
      localStorage.setItem('chatbot_session_id', newSessionId);
      const initialMessage = { text: "### Vanakam! 👋 \nWelcome to the **MIET AI Support**. I'm here to help you navigate campus life, courses, and admissions. \n\n*How can I assist you today?*", sender: 'bot' };
      setMessages([initialMessage]);
      localStorage.setItem('chatbot_messages', JSON.stringify([initialMessage]));
      if (timerRef.current) startInactivityTimer();
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>MIET AI Support</h3>
                <span style={{
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: 0.8
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    background: isConnected ? '#00ff00' : '#ff0000',
                    borderRadius: '50%',
                    boxShadow: isConnected ? '0 0 5px #00ff00' : 'none'
                  }}></span>
                  {isConnected ? 'Live Agent Connected' : 'Connecting...'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleReset}
                className="header-icon-btn"
                title="Clear Chat"
              >
                <RefreshCcw size={20} />
              </button>
              <button onClick={() => setIsOpen(false)} className="header-icon-btn">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.text.includes('[ADMISSION_BUTTON]') ? (
                  <div className="admission-cta">
                    <ReactMarkdown>{msg.text.replace('[ADMISSION_BUTTON]', '')}</ReactMarkdown>
                    <button
                      className="apply-btn-inline"
                      onClick={() => window.location.href = '/apply'}
                    >
                      Apply for Admission 2026
                    </button>
                  </div>
                ) : (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
              </div>
            ))}
            {loading && (
              <div className="message bot typing">
                MIET Assistant is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                startInactivityTimer(); // Reset timer while typing
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={loading}>
              <Send size={20} />
            </button>
          </div>
        </div>
      )}

      <button className="chat-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={30} /> : <MessageSquare size={30} />}
      </button>
    </div>
  );
};

export default Chatbot;
