// src/pages/SymptomChecker.jsx
import React, { useState } from "react";
import { 
  Stethoscope, 
  Utensils, 
  User, 
  Scale, 
  Activity, 
  Heart, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  ChevronDown,
  Zap,
  TrendingUp,
  Clock,
  Star
} from "lucide-react";
import './SymptomChecker.css';

const SYMPTOM_API = "http://localhost:8484";
const DIET_API = "http://localhost:8485";

const SymptomChecker = () => {
  // Symptom states
  const [symptoms, setSymptoms] = useState("");
  const [symptomResult, setSymptomResult] = useState(null);
  const [symptomLoading, setSymptomLoading] = useState(false);

  // Diet states
  const [age, setAge] = useState("");
  const [bmi, setBmi] = useState("");
  const [activity, setActivity] = useState("Sedentary");
  const [diabetes, setDiabetes] = useState(false);
  const [hypertension, setHypertension] = useState(false);
  const [dietResult, setDietResult] = useState(null);
  const [dietLoading, setDietLoading] = useState(false);
  const [showDietForm, setShowDietForm] = useState(false);

  // Handle Symptom Analysis
  const handleSymptomCheck = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setSymptomLoading(true);
    setSymptomResult(null);

    try {
      const res = await fetch(`${SYMPTOM_API}/analyze-symptoms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (!res.ok) {
        throw new Error("Symptom analysis failed");
      }

      const data = await res.json();
      setSymptomResult(data);
    } catch (err) {
      console.error(err);
      setSymptomResult({ error: "Failed to analyze symptoms. Please try again." });
    } finally {
      setSymptomLoading(false);
    }
  };

  // Handle Diet Recommendation
  const handleDietCheck = async (e) => {
    e.preventDefault();
    if (!age || !bmi) return;

    setDietLoading(true);
    setDietResult(null);

    try {
      const res = await fetch(`${DIET_API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Age: parseInt(age),
          BMI: parseFloat(bmi),
          ActivityLevel: activity,
          Diabetes: diabetes,
          Hypertension: hypertension,
        }),
      });

      if (!res.ok) {
        throw new Error("Diet recommendation failed");
      }

      const data = await res.json();
      setDietResult(data);
    } catch (err) {
      console.error(err);
      setDietResult({ error: "Failed to get diet recommendation. Please try again." });
    } finally {
      setDietLoading(false);
    }
  };

  const toggleDietForm = () => {
    setShowDietForm(!showDietForm);
  };

  return (
    <div className="symptom-checker-container">
      <div className="sc-header">
        <div className="sc-icon">
          <Stethoscope size={32} />
        </div>
        <h1>Health Assessment Tools</h1>
        <p>Get AI-powered symptom analysis and personalized diet recommendations</p>
      </div>

      <div className="tools-grid">
        {/* ===== Symptom Section ===== */}
        <section className="tool-card symptom-section">
          <div className="tool-header">
            <div className="tool-icon">
              <Zap size={24} />
            </div>
            <h2>Symptom Checker</h2>
          </div>
          <p className="tool-description">Describe your symptoms to get specialist recommendations</p>

          <form onSubmit={handleSymptomCheck} className="sc-form">
            <div className="input-group">
              <label htmlFor="symptoms">Describe Your Symptoms</label>
              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Enter your symptoms (e.g., headache, fever, fatigue...)"
                disabled={symptomLoading}
                rows={3}
              />
            </div>

            <button 
              type="submit" 
              className="analyze-btn primary"
              disabled={symptomLoading || !symptoms.trim()}
            >
              {symptomLoading ? (
                <>
                  <Loader size={18} className="spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Stethoscope size={18} />
                  Analyze Symptoms
                </>
              )}
            </button>
          </form>

          {symptomResult && (
            <div className="result-container">
              {symptomResult.error ? (
                <div className="error-message">
                  <AlertCircle size={20} />
                  <span>{symptomResult.error}</span>
                </div>
              ) : (
                <div className="result-card success">
                  <div className="result-header">
                    <CheckCircle size={24} className="success-icon" />
                    <h3>Recommended Specialist</h3>
                  </div>
                  
                  <div className="specialist-type">{symptomResult.specialist}</div>
                  
                  {symptomResult.urgency && (
                    <div className="urgency-level">
                      <span className="urgency-label">Urgency:</span>
                      <span className={`urgency-value ${symptomResult.urgency.toLowerCase()}`}>
                        {symptomResult.urgency}
                      </span>
                    </div>
                  )}
                  
                  {symptomResult.recommended_doctors && symptomResult.recommended_doctors.length > 0 && (
                    <div className="doctors-list">
                      <h4>Recommended Healthcare Providers:</h4>
                      <ul>
                        {symptomResult.recommended_doctors.map((doc, i) => (
                          <li key={i}>
                            <Star size={14} />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ===== Diet Section ===== */}
        <section className="tool-card diet-section">
          <div className="tool-header">
            <div className="tool-icon">
              <TrendingUp size={24} />
            </div>
            <h2>Diet Recommendation</h2>
          </div>
          <p className="tool-description">Get personalized diet plans based on your health profile</p>

          <button 
            type="button" 
            className="diet-toggle-btn"
            onClick={toggleDietForm}
          >
            <span>{showDietForm ? "Hide Diet Form" : "Show Diet Form"}</span>
            <ChevronDown size={20} className={showDietForm ? "open" : ""} />
          </button>

          {showDietForm && (
            <form onSubmit={handleDietCheck} className="sc-form">
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="age">
                    <User size={16} />
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    disabled={dietLoading}
                    min="1"
                    max="120"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="bmi">
                    <Scale size={16} />
                    BMI
                  </label>
                  <input
                    id="bmi"
                    type="number"
                    step="0.1"
                    value={bmi}
                    onChange={(e) => setBmi(e.target.value)}
                    placeholder="Enter your BMI"
                    disabled={dietLoading}
                    min="10"
                    max="50"
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="activity">
                  <Activity size={16} />
                  Activity Level
                </label>
                <select
                  id="activity"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  disabled={dietLoading}
                >
                  <option value="Sedentary">Sedentary (little or no exercise)</option>
                  <option value="Light">Light (light exercise 1-3 days/week)</option>
                  <option value="Moderate">Moderate (moderate exercise 3-5 days/week)</option>
                  <option value="Active">Active (intense exercise 6-7 days/week)</option>
                </select>
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={diabetes}
                    onChange={(e) => setDiabetes(e.target.checked)}
                    disabled={dietLoading}
                  />
                  <span className="checkmark"></span>
                  <Heart size={16} />
                  Diabetes
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hypertension}
                    onChange={(e) => setHypertension(e.target.checked)}
                    disabled={dietLoading}
                  />
                  <span className="checkmark"></span>
                  <AlertCircle size={16} />
                  Hypertension
                </label>
              </div>

              <button 
                type="submit" 
                className="analyze-btn secondary"
                disabled={dietLoading || !age || !bmi}
              >
                {dietLoading ? (
                  <>
                    <Loader size={18} className="spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Utensils size={18} />
                    Get Diet Recommendation
                  </>
                )}
              </button>
            </form>
          )}

          {dietResult && (
            <div className="result-container">
              {dietResult.error ? (
                <div className="error-message">
                  <AlertCircle size={20} />
                  <span>{dietResult.error}</span>
                </div>
              ) : (
                <div className="result-card success">
                  <div className="result-header">
                    <Utensils size={24} className="diet-icon" />
                    <h3>Personalized Diet Plan</h3>
                  </div>
                  
                  <div className="diet-plan">{dietResult.RecommendedDietPlan}</div>
                  
                  {dietResult.Probabilities && (
                    <div className="probabilities">
                      <h4>Recommendation Confidence:</h4>
                      <div className="probability-bars">
                        {Object.entries(dietResult.Probabilities)
                          .sort((a, b) => b[1] - a[1])
                          .map(([plan, prob]) => (
                            <div key={plan} className="probability-item">
                              <div className="plan-name">{plan}</div>
                              <div className="probability-bar">
                                <div 
                                  className="probability-fill" 
                                  style={{ width: `${prob * 100}%` }}
                                ></div>
                              </div>
                              <div className="probability-value">{(prob * 100).toFixed(1)}%</div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SymptomChecker;