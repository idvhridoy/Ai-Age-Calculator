import React from 'react';
import Header from './components/Header';
import Camera from './components/Camera';
import AgeCalculator from './components/AgeCalculator';
import AdvancedInsights from './modules/AdvancedInsights';
import AnimatedBackground from './components/AnimatedBackground';
import styles from './App.module.css';

const mockHealthData = {
  chronological_age: 30,
  biological_age: 28,
  cognitive_age: 29,
  health_score: 0.85,
  longevity_analysis: {
    genetic_risk: 0.15,
    lifestyle_quality: 0.82,
    environmental_impact: 0.75,
    stress_resilience: 0.68
  },
  cognitive_insights: [
    "Strong memory retention and recall abilities",
    "Above average focus and concentration",
    "Excellent learning adaptability",
    "Fast information processing speed"
  ],
  health_recommendations: [
    "Maintain regular exercise routine",
    "Consider adding meditation to reduce stress",
    "Increase intake of antioxidant-rich foods",
    "Ensure adequate sleep quality"
  ]
};

function App() {
  return (
    <>
      <AnimatedBackground />
      <div className={styles.app}>
        <Header />
        <main className={styles.mainContent}>
          <Camera />
          <AgeCalculator />
          <AdvancedInsights healthData={mockHealthData} />
        </main>
      </div>
    </>
  );
}

export default App;
