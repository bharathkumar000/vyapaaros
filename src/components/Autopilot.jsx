import React, { useState, useEffect } from 'react';

export default function Autopilot() {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const goals = [
    {
      id: 'goal-1',
      title: 'Increase Profit Margin by 10%',
      desc: 'Halt slow-moving items, negotiate supplier rates, and adjust price markups.'
    },
    {
      id: 'goal-2',
      title: 'Accelerate Cash Collection',
      desc: 'Send soft payment reminders, negotiate credit terms, and collect overdues.'
    }
  ];

  const steps = {
    'goal-1': [
      { title: "Analyzing SKUs", desc: "Found 3 slow-moving products (premium ghee and coconut oil variants)." },
      { title: "Negotiating with Annapoorna", desc: "Sent automated bulk discount request for Sona Masoori Rice based on volume." },
      { title: "Adjusting Price DNA Markup", desc: "Set Sona Masoori markup margin parameters to 14.5% automatically." },
      { title: "Monitoring margins", desc: "Simulation shows margin lift of +8.4% starting next week." }
    ],
    'goal-2': [
      { title: "Scanning Books for Receivables", desc: "Identified ₹2,18,300 in customer credit accounts." },
      { title: "Drafting WhatsApp Prompts", desc: "Prepared personalized regional voice & text billing receipts." },
      { title: "Releasing Reminders", desc: "Sent reminders to 3 clients overdue by 15+ days (Mahaveer, etc)." },
      { title: "Autopilot tracking active", desc: "Reconciliation engine watching payments via bank webhook." }
    ]
  };

  useEffect(() => {
    let timer;
    if (running && selectedGoal) {
      if (currentStep < steps[selectedGoal].length) {
        timer = setTimeout(() => {
          setCurrentStep(s => s + 1);
        }, 2000);
      } else {
        setRunning(false);
      }
    }
    return () => clearTimeout(timer);
  }, [running, currentStep, selectedGoal]);

  const handleStart = (goalId) => {
    setSelectedGoal(goalId);
    setRunning(true);
    setCurrentStep(0);
  };

  return (
    <div className="centered-view">
      <div className="view-title">
        <p className="eyebrow">AUTONOMOUS OPERATIONAL FLOW</p>
        <h2>Business Autopilot</h2>
        <p>Set high-level business goals, and the AI agent runs the back-office actions autonomously.</p>
      </div>

      <div className="autopilot-container">
        <div className="goal-selection">
          <label>Select a Business Goal for Autopilot</label>
          <div className="goal-options">
            {goals.map(goal => (
              <div 
                key={goal.id} 
                className={`goal-card ${selectedGoal === goal.id ? 'selected-goal' : ''}`}
                onClick={() => handleStart(goal.id)}
              >
                <h3>🎯 {goal.title}</h3>
                <p>{goal.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedGoal && (
          <div className="pilot-status">
            <div className="pilot-head">
              <h4>Goal: {goals.find(g => g.id === selectedGoal).title}</h4>
              <span className="pilot-badge">{running ? 'Running 🤖' : 'Done ✓'}</span>
            </div>

            <div className="pilot-steps">
              {steps[selectedGoal].map((step, idx) => {
                let statusClass = 'pending';
                let marker = '◌';
                
                if (idx < currentStep) {
                  statusClass = 'done';
                  marker = '✓';
                } else if (idx === currentStep && running) {
                  statusClass = 'active';
                  marker = '⚙';
                }

                return (
                  <div key={idx} className="pilot-step">
                    <span className={`step-marker ${statusClass}`}>{marker}</span>
                    <div>
                      <b>{step.title}</b>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
