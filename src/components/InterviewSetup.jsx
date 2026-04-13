import React, { useState } from 'react';
import { User, Briefcase, FileText, ArrowRight } from 'lucide-react';

export default function InterviewSetup({ onStart }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    skills: '',
    experience: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.role) {
      onStart(formData);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: 'auto', marginTop: '10vh' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <User size={28} color="var(--accent)" />
        Welcome to AI Interviewer
      </h2>
      <p style={{ marginBottom: '2rem' }}>
        Please provide your details below. The AI will generate custom interview questions based on your profile, role, and skills.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. John Doe"
              required 
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="role">Applied Role *</label>
          <div style={{ position: 'relative' }}>
            <Briefcase size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              id="role" 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              placeholder="e.g. Frontend Engineer"
              required 
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="skills">Key Skills (comma separated)</label>
          <div style={{ position: 'relative' }}>
            <FileText size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              id="skills" 
              name="skills" 
              value={formData.skills} 
              onChange={handleChange} 
              placeholder="e.g. React, Node.js, Python"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="experience">Brief Experience Summary</label>
          <textarea 
            id="experience" 
            name="experience" 
            rows="3" 
            value={formData.experience} 
            onChange={handleChange} 
            placeholder="Briefly describe your past projects or current role..."
          ></textarea>
        </div>

        <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
          Start Interview <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
