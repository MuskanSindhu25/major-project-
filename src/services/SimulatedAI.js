// Simple Simulated AI to emulate an interviewer

export class SimulatedAI {
  constructor(candidateData) {
    this.candidateData = candidateData;
    this.questionsAsked = 0;
    this.maxQuestions = 5;
    this.history = []; // { role: 'ai' | 'candidate', text: string }
    this.difficulty = 5; // 1 to 10
    
    // Base Question Templates
    this.questionBank = {
      intro: [
        `Welcome \${name}. I see you're applying for the \${role} position. Can you briefly walk me through your background?`,
        `Hello \${name}. To start, tell me why you're interested in the \${role} role and what makes you a good fit?`
      ],
      skills: [
        `You mentioned you have experience with \${skill}. Could you explain a scenario where you used it to solve a complex problem?`,
        `How would you rate your proficiency in \${skill}? Can you give an example of a project where it was critical?`,
        `Explain the core concept behind \${skill} as if you were explaining it to a beginner.`
      ],
      projects: [
        `Looking at your projects, can you explain the most challenging technical decision you had to make?`,
        `What challenges did you face in your recent projects, and how did you resolve them?`
      ],
      behavioral: [
        `Tell me about a time you had a disagreement with a team member. How did you handle it?`,
        `Describe a situation where you had to meet a tight deadline. How did you prioritize your work?`
      ],
      situational: [
        `If you were given a completely new technology to learn for a project starting next week, how would you approach it?`,
        `Imagine you discover a critical bug right before a major release. What are your immediate steps?`
      ]
    };
  }

  // Returns { text: string, type: 'question' | 'feedback', rating?: number }
  async getInitialContext() {
    await this.delay(1000);
    const q = this.getRandomQuestion('intro');
    this.history.push({ role: 'ai', text: q });
    return { text: q, type: 'question' };
  }

  async processAnswer(answerText) {
    this.history.push({ role: 'candidate', text: answerText });
    
    // Simulate thinking delay based on answer length
    await this.delay(1500 + Math.random() * 1000);

    // Provide feedback for the answer
    const feedback = this.generateFeedback(answerText);
    
    // Adjust difficulty
    if (feedback.rating >= 7) {
      this.difficulty = Math.min(10, this.difficulty + 1);
    } else if (feedback.rating <= 5) {
      this.difficulty = Math.max(1, this.difficulty - 1);
    }

    this.questionsAsked++;

    // Check if interview is over
    if (this.questionsAsked >= this.maxQuestions) {
      const closing = "Thank you for your time. This concludes our interview. I'll provide your performance summary shortly.";
      this.history.push({ role: 'ai', text: closing });
      return { feedback, nextQuestion: closing, isComplete: true };
    }

    // Prepare next question based on current step
    let nextCategory = 'behavioral';
    if (this.questionsAsked === 1) nextCategory = 'skills';
    else if (this.questionsAsked === 2) nextCategory = 'projects';
    else if (this.questionsAsked === 3) nextCategory = 'situational';

    const nextQ = this.getRandomQuestion(nextCategory);
    this.history.push({ role: 'ai', text: nextQ });

    return { feedback, nextQuestion: nextQ, isComplete: false };
  }

  generateFeedback(answer) {
    const wordCount = answer.split(' ').length;
    let rating = 5;
    let comments = "";

    const goodKeywords = ['implemented', 'resolved', 'lead', 'designed', 'optimized', 'because', 'example', 'experience', 'learned'];
    const weakKeywords = ['maybe', 'i dont know', 'not sure', 'probably', 'guess'];

    let goodCount = 0;
    let weakCount = 0;
    
    const lowerAnswer = answer.toLowerCase();
    goodKeywords.forEach(kw => { if (lowerAnswer.includes(kw)) goodCount++; });
    weakKeywords.forEach(kw => { if (lowerAnswer.includes(kw)) weakCount++; });

    if (wordCount < 15) {
      rating = 4;
      comments = "Your answer was quite brief. It would be better to provide more context or an example.";
    } else if (weakCount > 1) {
      rating -= 2;
      comments = "You sounded a bit uncertain. Try to speak more confidently about your experience.";
    } else if (wordCount > 100) {
      rating = 7;
      comments = "Good detail, but try to keep your answers slightly more concise and focused.";
    } else if (goodCount >= 2) {
      rating = Math.min(10, 8 + goodCount - 2);
      comments = "Great answer. You used concrete examples and explained your reasoning clearly.";
    } else {
      rating = 6;
      comments = "Good response, but you could improve by adding a specific real-world example.";
    }

    return {
      text: comments,
      rating: rating
    };
  }

  getFinalReport() {
    // Generate a mock report based on overall difficulty and performance
    const avgScore = this.difficulty; // a rough proxy
    return {
      score: (avgScore).toFixed(1) + "/10",
      strengths: [
        "Good clear communication when explaining basic concepts.",
        "Demonstrated familiarity with modern practices.",
        "Maintained professional tone throughout."
      ],
      weaknesses: [
        "Sometimes lacked specific real-world examples in technical questions.",
        "Could expand more on architectural decisions."
      ],
      suggestion: "We recommend practicing the STAR (Situation, Task, Action, Result) method to structure your behavioral and project-based answers more effectively."
    };
  }

  getRandomQuestion(category) {
    const list = this.questionBank[category] || this.questionBank['behavioral'];
    const q = list[Math.floor(Math.random() * list.length)];
    return this.replaceVariables(q);
  }

  replaceVariables(str) {
    const skillsList = this.candidateData.skills ? this.candidateData.skills.split(',').map(s=>s.trim()) : ['React'];
    const randomSkill = skillsList[Math.floor(Math.random() * skillsList.length)] || 'React';
    
    return str
      .replace(/\${name}/g, this.candidateData.name || 'Candidate')
      .replace(/\${role}/g, this.candidateData.role || 'Software Engineer')
      .replace(/\${skill}/g, randomSkill);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
