import { useState, FormEvent } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import styles from './AgeCalculator.module.css';
import { VisualAgeAnalysis, DigitalTwin } from '../modules/FuturisticFeatures';
import AdvancedInsights from '../modules/AdvancedInsights';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface AgeResults {
  chronological_age: number;
  biological_age: number;
  cognitive_age: number;
  health_score: number;
  health_status: string;
  recommendations: Array<{
    category: string;
    recommendation: string;
    impact: string;
  }>;
  age_prediction: {
    age_in_5_years: number;
    biological_age_in_5_years: number;
    potential_improvement: number;
  };
  metrics: {
    bmi: number;
    bmi_category: string;
    exercise_level: string;
    stress_impact: string;
    sleep_quality: string;
  };
}

interface FormData {
  birthDate: string;
  weight: number;
  height: number;
  exercise_frequency: number;
  mental_activity: number;
  sleep_hours: number;
  stress_level: number;
  diet_quality: number;
  smoking: boolean;
  alcohol_frequency: number;
}

const defaultFormData: FormData = {
  birthDate: '',
  weight: 70,
  height: 170,
  exercise_frequency: 0,
  mental_activity: 1,
  sleep_hours: 7,
  stress_level: 5,
  diet_quality: 3,
  smoking: false,
  alcohol_frequency: 0
};

export default function AgeCalculator() {
  const [results, setResults] = useState<AgeResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' || name === 'exercise_frequency' || name === 'mental_activity' || 
              name === 'diet_quality' || name === 'alcohol_frequency' ? 
              Number(value) : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.birthDate) {
      setError('Please enter your date of birth');
      return false;
    }
    if (formData.weight < 30 || formData.weight > 200) {
      setError('Please enter a valid weight (30-200 kg)');
      return false;
    }
    if (formData.height < 100 || formData.height > 250) {
      setError('Please enter a valid height (100-250 cm)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('Sending data:', formData); // Debug log
      
      const response = await fetch('http://localhost:5000/api/calculate-age', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate age');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRadarData = (results: AgeResults) => {
    return {
      labels: ['Health Score', 'Physical Activity', 'Mental Activity', 'Sleep Quality', 'Stress Management', 'Diet Quality'],
      datasets: [
        {
          label: 'Your Health Metrics',
          data: [
            results.health_score,
            formData.exercise_frequency * 20,
            formData.mental_activity * 20,
            formData.sleep_hours * 11,
            (10 - formData.stress_level) * 10,
            formData.diet_quality * 20
          ],
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  return (
    <div className={styles.container}>
      <h1>Project FuturAge</h1>
      <div className={styles.mainContent}>
        <div className={styles.inputSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="birthDate">Date of Birth:</label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="weight">Weight (kg):</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="30"
                  max="200"
                  step="0.1"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="height">Height (cm):</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  min="100"
                  max="250"
                  step="0.1"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="exercise_frequency">Exercise (days/week):</label>
                <input
                  type="range"
                  id="exercise_frequency"
                  name="exercise_frequency"
                  value={formData.exercise_frequency}
                  onChange={handleInputChange}
                  min="0"
                  max="7"
                  step="1"
                  className={styles.slider}
                />
                <span className={styles.sliderValue}>{formData.exercise_frequency} days/week</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="sleep_hours">Sleep (hours/day):</label>
                <input
                  type="range"
                  id="sleep_hours"
                  name="sleep_hours"
                  value={formData.sleep_hours}
                  onChange={handleInputChange}
                  min="4"
                  max="12"
                  step="0.5"
                  className={styles.slider}
                />
                <span className={styles.sliderValue}>{formData.sleep_hours} hours</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="stress_level">Stress Level (1-10):</label>
                <input
                  type="range"
                  id="stress_level"
                  name="stress_level"
                  value={formData.stress_level}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  step="1"
                  className={styles.slider}
                />
                <span className={styles.sliderValue}>{formData.stress_level}/10</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="diet_quality">Diet Quality (1-5):</label>
                <input
                  type="range"
                  id="diet_quality"
                  name="diet_quality"
                  value={formData.diet_quality}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  step="1"
                  className={styles.slider}
                />
                <span className={styles.sliderValue}>{formData.diet_quality}/5</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="mental_activity">Mental Activity:</label>
                <input
                  type="range"
                  id="mental_activity"
                  name="mental_activity"
                  value={formData.mental_activity}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  step="1"
                  className={styles.slider}
                />
                <span className={styles.sliderValue}>{formData.mental_activity}/10</span>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="smoking"
                    checked={formData.smoking}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                  />
                  Smoker
                </label>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="alcohol_frequency">Alcohol Consumption:</label>
                <input
                  type="range"
                  id="alcohol_frequency"
                  name="alcohol_frequency"
                  value={formData.alcohol_frequency}
                  onChange={handleInputChange}
                  min="0"
                  max="7"
                  step="1"
                  className={styles.slider}
                />
                <span className={styles.sliderValue}>{formData.alcohol_frequency} days/week</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Calculating...' : 'Calculate Age Metrics'}
            </button>
          </form>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />
          </div>
        )}

        {results && !loading && (
          <div className={styles.resultsContainer}>
            <div className={styles.ageMetrics}>
              <h2>Age Analysis Results</h2>
              <div className={styles.resultsGrid}>
                <div className={styles.ageCard}>
                  <h3>Chronological Age</h3>
                  <p>{results.chronological_age} years</p>
                </div>
                <div className={styles.ageCard}>
                  <h3>Biological Age</h3>
                  <p>{results.biological_age} years</p>
                  <span className={styles.status}>Health: {results.health_status}</span>
                </div>
                <div className={styles.ageCard}>
                  <h3>Cognitive Age</h3>
                  <p>{results.cognitive_age} years</p>
                </div>
                <div className={styles.healthScoreCard}>
                  <h3>Health Score</h3>
                  <div className={styles.scoreCircle} style={{
                    background: `conic-gradient(#3498db ${results.health_score}%, #eee ${results.health_score}% 100%)`
                  }}>
                    <span>{Math.round(results.health_score)}%</span>
                  </div>
                </div>
              </div>

              {results.metrics && (
                <div className={styles.metricsSection}>
                  <h3>Health Metrics</h3>
                  <div className={styles.radarChart}>
                    <Radar data={getRadarData(results)} options={{
                      scales: {
                        r: {
                          min: 0,
                          max: 100,
                          beginAtZero: true
                        }
                      }
                    }} />
                  </div>
                </div>
              )}

              {results.age_prediction && (
                <div className={styles.predictionSection}>
                  <h3>5-Year Prediction</h3>
                  <div className={styles.predictionGrid}>
                    <div className={styles.predictionCard}>
                      <h4>Projected Age</h4>
                      <p>{results.age_prediction.age_in_5_years} years</p>
                    </div>
                    <div className={styles.predictionCard}>
                      <h4>Projected Biological Age</h4>
                      <p>{Math.round(results.age_prediction.biological_age_in_5_years)} years</p>
                    </div>
                    <div className={styles.predictionCard}>
                      <h4>Potential Improvement</h4>
                      <p>{results.age_prediction.potential_improvement} years younger</p>
                    </div>
                  </div>
                </div>
              )}

              {results.recommendations && results.recommendations.length > 0 && (
                <div className={styles.recommendationsSection}>
                  <h3>Personalized Recommendations</h3>
                  <div className={styles.recommendationsList}>
                    {results.recommendations.map((rec, index) => (
                      <div key={index} className={`${styles.recommendationCard} ${styles[`priority${rec.impact}`]}`}>
                        <h4>{rec.category}</h4>
                        <p>{rec.recommendation}</p>
                        <span className={styles.impact}>Priority: {rec.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.futuristicFeatures}>
              <VisualAgeAnalysis />
              <DigitalTwin 
                healthMetrics={{
                  bmi: results.metrics.bmi,
                  healthScore: results.health_score,
                  sleepQuality: results.metrics.sleep_quality,
                  stressLevel: results.metrics.stress_impact,
                  dietQuality: results.metrics.diet_quality
                }}
                ageData={{
                  chronological: results.chronological_age,
                  biological: results.biological_age,
                  predicted: results.age_prediction?.age_in_5_years
                }}
              />
            </div>

            <div className={styles.advancedInsights}>
              <AdvancedInsights 
                healthData={{
                  ...results,
                  longevity_analysis: {
                    genetic_risk: 1 - (results.health_score / 100),
                    lifestyle_quality: results.metrics.exercise_level === 'High' ? 0.9 : 
                                     results.metrics.exercise_level === 'Medium' ? 0.6 : 0.3,
                    environmental_impact: results.metrics.stress_impact === 'Low' ? 0.8 : 
                                        results.metrics.stress_impact === 'Medium' ? 0.5 : 0.2,
                    stress_resilience: (10 - results.stress_level) / 10
                  },
                  ai_insights: results.recommendations.map(rec => 
                    `${rec.category}: ${rec.recommendation} (Impact: ${rec.impact})`
                  ).join('\n')
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
