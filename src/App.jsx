import React, { useState } from 'react';
import InterviewSetup from './components/InterviewSetup';
import InterviewSession from './components/InterviewSession';
import InterviewReport from './components/InterviewReport';

function App() {
  const [phase, setPhase] = useState('setup'); // 'setup', 'interview', 'report'
  const [candidateData, setCandidateData] = useState(null);
  const [report, setReport] = useState(null);
  
  const handleStart = (data) => {
    setCandidateData(data);
    setPhase('interview');
  };

  const handleFinish = (finalReport) => {
    setReport(finalReport);
    setPhase('report');
  };

  const handleRestart = () => {
    setPhase('setup');
    setCandidateData(null);
    setReport(null);
  };

  return (
    <div className="app-container">
      {phase === 'setup' && <InterviewSetup onStart={handleStart} />}
      {phase === 'interview' && (
        <InterviewSession 
          candidateData={candidateData} 
          onFinish={handleFinish} 
        />
      )}
      {phase === 'report' && (
        <InterviewReport 
          candidateData={candidateData} 
          report={report} 
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
}

export default App;
