import { useState, useEffect, useRef, useCallback } from 'react';

const getBotResponse = (text) => {
  const input = text.toLowerCase();
  
  // Escalation Conditions
  const escalationRegex = /(angry|frustrated|dispute|technical error|not resolved|missing|damaged|broken|wrong item|manager|human|agent|upset|mad)/;
  if (escalationRegex.test(input)) {
    return "I understand your concern. Let me connect you to our support team for further assistance.";
  }

  let baseResponse = "Hello! I am your E-commerce Support Assistant. I can help with orders, returns, refunds, payments, and account issues.";
  let endPhrase = " Is there anything else I can help you with?";
  let needsEndPhrase = true;

  // 1. Order tracking
  if (/(track|where|status.*order|when.*arrive|delivery|shipping)/.test(input)) {
    baseResponse = "I can definitely help you track your order. Could you please provide your 10-digit order ID? For your reference, standard orders are delivered within 3–7 business days.";
  }
  // 2. Return request
  else if (/(return|send back|exchange)/.test(input)) {
    baseResponse = "I can guide you through the return process. Could you please provide your order ID to check if the item is eligible? Please note our return policy allows returns up to 7 days after delivery.";
  }
  // 3. Refund status
  else if (/(refund|money back)/.test(input)) {
    baseResponse = "I can check your refund status. Please share your order ID. Refunds are typically processed within 5–7 business days after the returned item is approved.";
  }
  // 4. Payment failure
  else if (/(pay|payment|failed|declined|card|upi|net banking|cod)/.test(input)) {
    baseResponse = "It looks like you might be having payment trouble. I suggest checking your bank balance, retrying the transaction, or using an alternative payment method. We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery.";
  }
  // 5. Login Issues
  else if (/(login|password|account|sign in|forgot|reset)/.test(input)) {
    baseResponse = "I can help with your account. If you're having trouble logging in, please try resetting your password using the 'Forgot Password' link on the login page.";
  }
  // Match generic greeting
  else if (/(hi|hello|hey|help)/.test(input)) {
    baseResponse = "Hello! I am your AI Support Assistant. How can I help you today?";
    needsEndPhrase = false;
  }
  // Fallback pattern if unsure
  else {
    baseResponse = "Let me connect you to our support team.";
    needsEndPhrase = false;
  }

  return needsEndPhrase ? baseResponse + endPhrase : baseResponse;
};

export function useChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your E-commerce Support Assistant. How can I help you with tracking, returns, payments, or account issues today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [isAgentActive, setIsAgentActive] = useState(false);
  
  // TTS & STT Web API integration
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert("Speech recognition isn't supported in this browser.");
    }
  };

  const handleSendMessage = useCallback((text) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    // Context-aware simulated bot/agent response
    setTimeout(() => {
      if (isAgentActive) {
        // Human Agent logic
        const userInput = text.toLowerCase();
        let agentReply = "";

        if (userInput.includes("98235") || userInput.includes("chair")) {
          agentReply = "Thank you! I've pulled up your account. I see your order for the Ergonomic Office Chair (ORD-98235). It is currently marked as 'Processing' because your UPI payment of ₹5,999 was pending confirmation from the bank. Good news: I have manually synced the transaction with NPCI. It is now confirmed, and your chair will dispatch by tomorrow morning!";
        } else if (userInput.includes("98210") || userInput.includes("keyboard")) {
          agentReply = "Thank you. I have your order for the Mechanical Keyboard (ORD-98210). Your return was successfully received by our warehouse! The refund of ₹3,499 back to your Net Banking account has been initiated and will reflect within 3-5 Indian bank working days.";
        } else if (userInput.includes("98234") || userInput.includes("headphone")) {
          agentReply = "I have your details. Your Wireless Headphones (ORD-98234) were successfully delivered on Oct 24th. The payment of ₹12,499 via Credit Card went smoothly. Are you facing any issues with the warranty or claiming a replacement?";
        } else {
          // Fallback Default
          agentReply = "Thank you for providing that. I've pulled up your account. I can see your order for the Smart Home Hub 2.0 (ORD-98288). It looks like your payment of ₹4,999 failed initially over the payment gateway. I've manually re-initiated the transaction link to fix this. Your product will now be expedited and delivered via Bluedart within 24 hours.";
        }

        const newAgentMsg = { id: Date.now() + 1, sender: 'agent', text: agentReply };
        setMessages(prev => [...prev, newAgentMsg]);
        setIsTyping(false);
        speakText(agentReply);
        // Turn agent mode off after resolving for demo reset purposes.
        setIsAgentActive(false);
      } else {
        // AI Bot logic
        const botReply = getBotResponse(text);
        const newBotMsg = { id: Date.now() + 1, sender: 'bot', text: botReply };
        setMessages(prev => [...prev, newBotMsg]);
        setIsTyping(false);
        
        speakText(botReply);

        // Execute Escalation logic if required
        if (botReply.includes("Let me connect you to our support team")) {
          setTimeout(() => setIsTyping(true), 1000); // Agent starts typing

          // Agent replies after connection delay
          setTimeout(() => {
            const agentReply = "Hi there, I am a Live Support Specialist. I see you're experiencing some issues. I can pull up your full order, return, and payment history immediately to help resolve this. Could you please provide your Order ID?";
            const newAgentMsg = { id: Date.now() + 2, sender: 'agent', text: agentReply };
            setMessages(prev => [...prev, newAgentMsg]);
            setIsTyping(false);
            speakText(agentReply);
            
            // Switch conversation handler to Agent
            setIsAgentActive(true);
          }, 4000);
        }
      }
    }, 1500);
  }, [isAgentActive]);

  return {
    messages,
    isTyping,
    isListening,
    startListening,
    handleSendMessage
  };
}
