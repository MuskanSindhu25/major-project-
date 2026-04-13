import { useState, useEffect, useCallback } from 'react';

export function useSpeechRecognition() {
  const [inputValue, setInputValue] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (e) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript + ' ';
          } else {
            currentInterim += e.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInputValue((prev) => prev + finalTranscript);
        }
        setInterimTranscript(currentInterim);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error', e);
        if (e.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use voice input.');
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      rec.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      setRecognition(rec);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMic = useCallback(() => {
    if (!recognition) return alert('Speech recognition not supported in your browser. Please try Chrome, Edge, or Safari.');
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      // Interrupt AI if candidate starts speaking
      window.speechSynthesis?.cancel(); 
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Mic start error", e);
      }
    }
  }, [recognition, isListening]);

  const toggleVoice = useCallback(() => {
    if (isVoiceEnabled) {
      window.speechSynthesis?.cancel();
    }
    setIsVoiceEnabled((prev) => !prev);
  }, [isVoiceEnabled]);

  const speak = useCallback((text) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // clear previous speech queue
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Tweak to mimic a highly natural, thoughtful conversational cadence
    utterance.rate = 0.95; 
    utterance.pitch = 1.05;

    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Known high-fidelity, neural "cloud-backed" or premium natural voices across Chrome, Edge, and Mac
        const premiumKeywords = [
          'Google US English', 'Google UK English Female', 
          'Microsoft Aria Online', 'Microsoft Guy Online', 'Microsoft Jenny Online',
          'Natural', 'Premium', 'Samantha', 'Siri'
        ];
        
        let selectedVoice = null;
        
        for (let keyword of premiumKeywords) {
          const match = voices.find(v => v.name.includes(keyword) && v.lang.startsWith('en'));
          if (match) {
            selectedVoice = match;
            break;
          }
        }

        // Tier 2 Fallback: Any English female voice usually sounds slightly more natural natively
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Zira')));
        }
        
        // Tier 3: Absolute fallback to any standard English voice
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('en'));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      window.speechSynthesis.speak(utterance);
    };

    // Browsers often load voices asynchronously on the first try
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
      };
    } else {
      setVoiceAndSpeak();
    }
  }, [isVoiceEnabled]);

  const resetTranscript = useCallback(() => {
    setInputValue('');
  }, []);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  }, [recognition, isListening]);

  return {
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
  };
}
