import React, { useEffect } from 'react';
import { Award, Briefcase, RefreshCw, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InterviewReport({ candidateData, report, onRestart }) {
  useEffect(() => {
    // Generate some confetti for the successful completion
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, { particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ maxWidth: '800px', margin: 'auto', marginTop: '5vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Award size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
        <h1>Interview Complete</h1>
        <p>Here is the final evaluation for <strong>{candidateData.name}</strong> applying for <strong>{candidateData.role}</strong>.</p>
      </div>

      <div className="report-grid">
        <div className="score-card glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <Star size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <div className="score-value">{report.score}</div>
          <h3 style={{ margin: 0 }}>Overall Score</h3>
          <p style={{ fontSize: '0.85rem' }}>Based on answer depth & confidence</p>
        </div>
        
        <div className="score-card glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
            <ThumbsUp size={20} /> Strengths
          </h3>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
            {report.strengths.map((str, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{str}</li>
            ))}
          </ul>
        </div>

        <div className="score-card glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
            <ThumbsDown size={20} /> Areas to Improve
          </h3>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
            {report.weaknesses.map((w, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{w}</li>
            ))}
          </ul>
        </div>

        <div className="score-card glass-panel" style={{ padding: '1.5rem', textAlign: 'left', background: 'rgba(94, 106, 210, 0.1)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={20} /> Recommendation
          </h3>
          <p style={{ marginTop: '1rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
            {report.suggestion}
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={onRestart} className="btn btn-secondary">
          <RefreshCw size={18} /> Take Another Interview
        </button>
      </div>
    </div>
  );
}
