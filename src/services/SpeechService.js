export class SpeechService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
        }
    }

    speak(text, onEnd) {
        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;

        // Pick a good female/professional voice if available
        const voices = this.synthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Female"));
        if (preferredVoice) utterance.voice = preferredVoice;

        if (onEnd) utterance.onend = onEnd;
        this.synthesis.speak(utterance);
    }

    startListening(onResult, onStatusChange) {
        if (!this.recognition) {
            console.error("Speech Recognition not supported");
            return;
        }

        this.recognition.onstart = () => {
            this.isListening = true;
            onStatusChange(true);
        };

        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            onResult(transcript, event.results[event.results.length - 1].isFinal);
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            this.stopListening(onStatusChange);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            onStatusChange(false);
        };

        this.recognition.start();
    }

    stopListening(onStatusChange) {
        if (this.recognition) {
            this.recognition.stop();
            this.isListening = false;
            if (onStatusChange) onStatusChange(false);
        }
    }
}
