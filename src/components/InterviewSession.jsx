import React, { useState, useEffect, useRef } from 'react';
import { SimulatedAI } from '../services/SimulatedAI';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Send, Mic, StopCircle, User, Bot, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InterviewSession({ candidateData, onFinish }) {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Destructure from custom hook
  const {
    inputValue,
    setInputValue,
    interimTranscript,
    isListening,
    isVoiceEnabled,
    toggleMic,
    toggleVoice,
    speak,
    resetTranscript,
    stopListening
  } = useSpeechRecognition();

  useEffect(() => {
    // Initialize AI session
    const aiInstance = new SimulatedAI(candidateData);
    setSession(aiInstance);
    
    // Welcome message
    const startInterview = async () => {
      setIsTyping(true);
      const res = await aiInstance.getInitialContext();
      setIsTyping(false);
      addMessage({
        id: Date.now(),
        sender: 'ai',
        text: res.text,
        type: 'question'
      });
      speak(res.text);
    };
    
    startInterview();

    // Clean up SpeechSynthesis on unmount entirely within the hook is slightly tricky,
    // so we just cancel speech here too for safety.
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, interimTranscript]);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !session) return;
    
    stopListening();

    const answer = inputValue.trim();
    resetTranscript();

    // Add candidate's message
    addMessage({
      id: Date.now(),
      sender: 'candidate',
      text: answer
    });

    setIsTyping(true);

    const res = await session.processAnswer(answer);
    
    setIsTyping(false);

    // Provide feedback inline
    if (res.feedback) {
      addMessage({
        id: Date.now() + 1,
        sender: 'system',
        text: `Feedback: ${res.feedback.text} | Rating: ${res.feedback.rating}/10`,
        rating: res.feedback.rating
      });
    }

    // Add next AI question
    if (res.nextQuestion) {
      addMessage({
        id: Date.now() + 2,
        sender: 'ai',
        text: res.nextQuestion,
        type: res.isComplete ? 'closing' : 'question'
      });
      speak(res.nextQuestion);
    }

    if (res.isComplete) {
      setTimeout(() => {
        onFinish(session.getFinalReport());
      }, 5000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderFeedbackProps = (rating) => {
    if (rating >= 7) return { class: 'feedback-bubble', icon: null };
    if (rating >= 5) return { class: 'feedback-bubble warning', icon: null };
    return { class: 'feedback-bubble danger', icon: <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> };
  };

  return (
    <div className="chat-container glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={24} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>AI Interviewer</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assessing for {candidateData.role}</span>
          </div>
        </div>
        <button 
          onClick={toggleVoice} 
          className="btn btn-icon btn-secondary" 
          title={isVoiceEnabled ? "Mute AI Voice" : "Enable AI Voice"}
          style={{ width: 36, height: 36 }}
        >
          {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
      
      <div className="chat-messages" style={{ flex: 1 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message system">
          Interview session started. Answer clearly and confidently.
        </motion.div>

        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            key={msg.id} 
            className={`message ${msg.sender}`}
            style={msg.sender === 'system' ? { width: '100%' } : {}}
          >
            {msg.sender === 'system' ? (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div className={renderFeedbackProps(msg.rating).class} style={{ maxWidth: '80%' }}>
                  {renderFeedbackProps(msg.rating).icon}
                  {msg.text}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.sender === 'candidate' ? 'row-reverse' : 'row' }}>
                <div style={{ alignSelf: 'flex-end', opacity: 0.7 }}>
                   {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div>
                  <p>{msg.text}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {interimTranscript && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message candidate" style={{ opacity: 0.5, fontStyle: 'italic' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'row-reverse' }}>
              <div style={{ alignSelf: 'flex-end', opacity: 0.7 }}><User size={16} /></div>
              <div><p>{interimTranscript} (listening...)</p></div>
            </div>
          </motion.div>
        )}

        {isTyping && (
          <div className="message ai">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area" style={{ flexShrink: 0 }}>
        <button 
          onClick={toggleMic} 
          className={`btn btn-icon ${isListening ? 'mic-active' : 'btn-secondary'}`}
          title={isListening ? "Stop Listening" : "Start Voice Input"}
        >
          {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
        </button>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="chat-textarea"
          placeholder={isListening ? "Listening... (speak now)" : "Type your answer here..."}
          disabled={isTyping}
          style={{ flex: 1 }}
        ></textarea>
        <button 
          onClick={handleSubmit} 
          className="btn btn-icon btn-secondary" 
          disabled={!inputValue.trim() || isTyping}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
