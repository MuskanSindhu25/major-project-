const QUESTION_BANK = {
    general: [
        "Tell me about yourself and your career journey so far.",
        "What motivated you to apply for this specific role?",
        "Where do you see yourself professionally in five years?",
        "What is your greatest professional achievement to date?",
        "How do you handle pressure and tight deadlines?"
    ],
    technical: {
        react: [
            "Explain the Virtual DOM and how React uses it for performance.",
            "What are the key differences between useMemo and useCallback?",
            "How do you handle complex state management in a large React app?",
            "Explain the lifecycle of a React component in terms of Hooks.",
            "What is the significance of 'keys' in React lists?"
        ],
        javascript: [
            "Explain the event loop and how asynchronous code is handled.",
            "What is the difference between prototypal and classical inheritance?",
            "Explain closures and provide a practical use case.",
            "How does the 'this' keyword behave in different contexts?",
            "What are the benefits of using arrow functions over traditional functions?"
        ],
        python: [
            "How does Python manage memory and what is the GIL?",
            "Explain the difference between deep and shallow copying.",
            "What are decorators and how can they be used for logging?",
            "How do you handle multi-threading versus multi-processing in Python?",
            "Explain the concept of generators and 'yield'."
        ],
        java: [
            "Explain the solid principles in Java development.",
            "What is the difference between Checked and Unchecked exceptions?",
            "How does the Garbage Collector work in the JVM?",
            "Explain the concept of Reflection in Java.",
            "What are the main differences between Abstract Classes and Interfaces?"
        ],
        node: [
            "How does Node.js handle non-blocking I/O operations?",
            "What is the purpose of the 'cluster' module?",
            "Explain the concept of middleware in Express.js.",
            "How do you manage environment variables safely?",
            "What are Streams and why are they important in Node.js?"
        ],
        databases: [
            "What are the trade-offs between SQL and NoSQL databases?",
            "Explain ACID properties in database transactions.",
            "How does indexing improve query performance?",
            "What is normalization and why is it important?",
            "Explain CAP theorem in distributed systems."
        ]
    },
    behavioral: [
        "Describe a challenging team conflict you resolved.",
        "Tell me about a time you had to learn a new technology quickly.",
        "Give an example of a time you took initiative on a project.",
        "Describe a situation where you had to admit you made a mistake.",
        "How do you prioritize your tasks when you have multiple competing deadlines?"
    ]
};

export class InterviewEngine {
    constructor() {
        this.resumeData = "";
        this.currentQuestions = [];
        this.currentIndex = -1;
        this.feedback = [];
        this.analysisKeywords = {
            technical: ['react', 'javascript', 'python', 'java', 'node', 'express', 'sql', 'nosql', 'aws', 'docker'],
            soft: ['leadership', 'communication', 'teamwork', 'problem solving', 'agile']
        };
    }

    setResume(text) {
        this.resumeData = text.toLowerCase();
        this.generateQuestions();
    }

    generateQuestions() {
        let questions = [...QUESTION_BANK.general];

        // Scan for technical skills
        Object.keys(QUESTION_BANK.technical).forEach(skill => {
            if (this.resumeData.includes(skill)) {
                questions = [...questions, ...QUESTION_BANK.technical[skill]];
            }
        });

        // Add behavioral
        questions = [...questions, ...QUESTION_BANK.behavioral];

        // Shuffle and pick a diverse set of 6
        this.currentQuestions = questions
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);

        this.currentIndex = 0;
    }

    getNextQuestion() {
        if (this.currentIndex < this.currentQuestions.length) {
            return this.currentQuestions[this.currentIndex++];
        }
        return null;
    }

    evaluateAnswer(userAnswer) {
        const text = userAnswer.toLowerCase();
        let score = 75; // Base score
        let feedbackStr = "";

        // Length analysis
        if (text.length < 30) {
            score -= 20;
            feedbackStr = "Your response and brief. In real interviews, try to provide more details and examples.";
        } else if (text.length > 200) {
            score += 10;
            feedbackStr = "Great elaboration! You provided a detailed response which shows depth of knowledge.";
        } else {
            score += 5;
            feedbackStr = "Good response length. You communicated your point clearly.";
        }

        // Keyword analysis (Simulating technical evaluation)
        const keywordsFound = this.analysisKeywords.technical.filter(k => text.includes(k));
        if (keywordsFound.length > 0) {
            score += 10;
            feedbackStr += " I noticed you mentioned relevant technical terms like " + keywordsFound.join(", ") + ".";
        }

        // Filler words detection
        const fillers = ['um', 'uh', 'like', 'basically', 'actually'];
        const fillerCount = fillers.reduce((acc, f) => acc + (text.split(f).length - 1), 0);
        if (fillerCount > 3) {
            score -= 10;
            feedbackStr += " Try to minimize filler words like 'um' or 'like' to sound more confident.";
        }

        score = Math.min(100, Math.max(0, score));

        const result = { score, analysis: feedbackStr };
        this.feedback.push(result);
        return result;
    }

    getFinalReport() {
        if (this.feedback.length === 0) return { averageScore: 0, overall: "No data" };

        const avgScore = this.feedback.reduce((a, b) => a + b.score, 0) / this.feedback.length;
        let overall = "Excellent Candidate";
        if (avgScore < 60) overall = "Needs Improvement";
        else if (avgScore < 80) overall = "Strong Potential";

        return {
            averageScore: Math.round(avgScore),
            feedbackSummary: this.feedback,
            overall: overall
        };
    }
}
