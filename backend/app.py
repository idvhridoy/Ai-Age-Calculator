from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import numpy as np
from typing import Dict, Any
import os
from dotenv import load_dotenv
import openai
import math

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

def calculate_bmi(weight, height):
    return weight / ((height / 100) ** 2)

def get_bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"

def calculate_health_score(data):
    try:
        score = 100
        
        # BMI Impact
        bmi = calculate_bmi(float(data.get('weight', 70)), float(data.get('height', 170)))
        if bmi < 18.5 or bmi > 30:
            score -= 15
        elif bmi < 25:
            score += 10
        
        # Exercise Impact
        score += min(float(data.get('exercise_frequency', 0)) * 3, 15)
        
        # Sleep Impact
        sleep_hours = float(data.get('sleep_hours', 7))
        if 7 <= sleep_hours <= 9:
            score += 10
        else:
            score -= 10
        
        # Stress Impact
        score -= float(data.get('stress_level', 5)) * 2
        
        # Diet Impact
        score += float(data.get('diet_quality', 3)) * 3
        
        # Habits Impact
        if data.get('smoking', False):
            score -= 20
        if float(data.get('alcohol_frequency', 0)) > 2:
            score -= 10
        
        return max(0, min(score, 100))
    except Exception as e:
        print(f"Error in calculate_health_score: {str(e)}")
        return 50  # Default score if calculation fails

def calculate_biological_age(metrics: Dict[str, Any]) -> float:
    base_age = float(metrics['chronological_age'])
    
    # Health impact factors
    bmi_impact = calculate_bmi_impact(metrics['weight'], metrics['height'])
    exercise_impact = float(metrics['exercise_frequency']) * -0.5
    sleep_impact = calculate_sleep_impact(float(metrics['sleep_hours']))
    stress_impact = float(metrics['stress_level']) * 0.3
    diet_impact = calculate_diet_impact(int(metrics['diet_quality']))
    
    # Habits impact
    smoking_impact = 2.0 if metrics['smoking'] else 0
    alcohol_impact = float(metrics['alcohol_frequency']) * 0.5
    
    # Calculate total impact
    total_impact = (bmi_impact + exercise_impact + sleep_impact + 
                   stress_impact + diet_impact + smoking_impact + 
                   alcohol_impact)
    
    return base_age + total_impact

def calculate_cognitive_age(metrics: Dict[str, Any]) -> float:
    base_age = float(metrics['chronological_age'])
    
    # Mental activity impact
    mental_impact = (5 - float(metrics['mental_activity'])) * 0.5
    
    # Sleep quality impact on cognitive age
    sleep_impact = calculate_sleep_impact(float(metrics['sleep_hours']))
    
    # Stress impact on cognitive function
    stress_impact = float(metrics['stress_level']) * 0.4
    
    return base_age + mental_impact + sleep_impact + stress_impact

def calculate_longevity_prediction(metrics: Dict[str, Any]) -> Dict[str, Any]:
    current_health_score = calculate_health_score(metrics)
    
    # Calculate potential improvement based on modifiable factors
    potential_improvement = calculate_potential_improvement(metrics)
    
    # Project age and health metrics for 5 years
    age_in_5_years = float(metrics['chronological_age']) + 5
    biological_impact_reduction = potential_improvement * 0.7
    biological_age_in_5_years = calculate_biological_age(metrics) + 5 - biological_impact_reduction
    
    return {
        'age_in_5_years': age_in_5_years,
        'biological_age_in_5_years': biological_age_in_5_years,
        'potential_improvement': round(potential_improvement, 1),
        'longevity_factors': analyze_longevity_factors(metrics)
    }

def analyze_longevity_factors(metrics: Dict[str, Any]) -> Dict[str, Any]:
    factors = {
        'genetic_risk': calculate_genetic_risk(metrics),
        'lifestyle_quality': calculate_lifestyle_quality(metrics),
        'environmental_impact': calculate_environmental_impact(metrics),
        'stress_resilience': calculate_stress_resilience(metrics)
    }
    
    return factors

def calculate_genetic_risk(metrics: Dict[str, Any]) -> float:
    # Simplified genetic risk calculation based on available metrics
    base_risk = 0.0
    if metrics['smoking']:
        base_risk += 0.3
    if float(metrics['alcohol_frequency']) > 2:
        base_risk += 0.2
    return min(1.0, base_risk)

def calculate_lifestyle_quality(metrics: Dict[str, Any]) -> float:
    exercise_score = float(metrics['exercise_frequency']) / 5.0
    diet_score = float(metrics['diet_quality']) / 5.0
    sleep_score = (float(metrics['sleep_hours']) - 4) / 8.0
    
    return (exercise_score + diet_score + sleep_score) / 3.0

def calculate_environmental_impact(metrics: Dict[str, Any]) -> float:
    # Placeholder for environmental impact calculation
    stress_factor = float(metrics['stress_level']) / 10.0
    return 1.0 - stress_factor

def calculate_stress_resilience(metrics: Dict[str, Any]) -> float:
    sleep_quality = (float(metrics['sleep_hours']) - 4) / 8.0
    stress_level = 1.0 - (float(metrics['stress_level']) / 10.0)
    exercise_factor = float(metrics['exercise_frequency']) / 5.0
    
    return (sleep_quality + stress_level + exercise_factor) / 3.0

async def get_ai_health_insights(metrics: Dict[str, Any]) -> Dict[str, Any]:
    try:
        prompt = f"""Analyze the following health metrics and provide detailed insights:
        - Age: {metrics['chronological_age']} years
        - BMI: {calculate_bmi(metrics['weight'], metrics['height']):.1f}
        - Exercise: {metrics['exercise_frequency']} days/week
        - Sleep: {metrics['sleep_hours']} hours/day
        - Stress Level: {metrics['stress_level']}/10
        - Diet Quality: {metrics['diet_quality']}/5
        - Smoking: {'Yes' if metrics['smoking'] else 'No'}
        - Alcohol Consumption: {metrics['alcohol_frequency']}/3
        
        Provide specific insights about:
        1. Current health status
        2. Potential health risks
        3. Personalized recommendations
        4. Long-term health trajectory
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a highly advanced AI health analyst specializing in longevity and wellness optimization."},
                {"role": "user", "content": prompt}
            ]
        )
        
        insights = response.choices[0].message.content
        return {'ai_insights': insights}
    except Exception as e:
        print(f"Error getting AI insights: {e}")
        return {'ai_insights': None}

@app.route('/calculate', methods=['POST'])
async def calculate():
    try:
        data = request.get_json()
        
        # Calculate ages
        chronological_age = calculate_chronological_age(data['birthDate'])
        biological_age = calculate_biological_age({**data, 'chronological_age': chronological_age})
        cognitive_age = calculate_cognitive_age({**data, 'chronological_age': chronological_age})
        
        # Calculate health metrics
        metrics = calculate_health_metrics(data)
        health_score = calculate_health_score(data)
        
        # Get AI-powered insights
        ai_insights = await get_ai_health_insights({**data, 'chronological_age': chronological_age})
        
        # Calculate predictions and recommendations
        predictions = calculate_longevity_prediction({**data, 'chronological_age': chronological_age})
        recommendations = generate_recommendations(metrics, health_score)
        
        response = {
            'chronological_age': chronological_age,
            'biological_age': round(biological_age, 1),
            'cognitive_age': round(cognitive_age, 1),
            'health_score': health_score,
            'health_status': determine_health_status(health_score),
            'metrics': metrics,
            'recommendations': recommendations,
            'age_prediction': predictions,
            'ai_insights': ai_insights.get('ai_insights'),
            'longevity_analysis': predictions['longevity_factors']
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/calculate-age', methods=['POST'])
def calculate_age():
    try:
        print("Received request")
        data = request.json
        print(f"Received data: {data}")

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate birthDate
        if 'birthDate' not in data or not data['birthDate']:
            return jsonify({'error': 'Birth date is required'}), 400

        try:
            birth_date = datetime.strptime(data['birthDate'], '%Y-%m-%d')
        except ValueError as e:
            return jsonify({'error': f'Invalid date format: {str(e)}'}), 400

        today = datetime.now()
        
        # Calculate chronological age
        chronological_age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        
        # Ensure all numeric fields are properly converted
        weight = float(data.get('weight', 70))
        height = float(data.get('height', 170))
        exercise_frequency = float(data.get('exercise_frequency', 0))
        mental_activity = float(data.get('mental_activity', 1))
        sleep_hours = float(data.get('sleep_hours', 7))
        stress_level = float(data.get('stress_level', 5))
        diet_quality = float(data.get('diet_quality', 3))
        smoking = bool(data.get('smoking', False))
        alcohol_frequency = float(data.get('alcohol_frequency', 0))

        # Calculate health score
        health_score = calculate_health_score(data)
        
        # Calculate biological age based on health metrics
        biological_modifier = (100 - health_score) / 100
        biological_age = chronological_age + (biological_modifier * 5)
        
        # Calculate cognitive age based on mental activity and stress
        cognitive_modifier = (mental_activity * 0.6 - stress_level * 0.4) / 5
        cognitive_age = chronological_age - cognitive_modifier
        
        # Calculate BMI and get category
        bmi = calculate_bmi(weight, height)
        bmi_category = get_bmi_category(bmi)

        # Calculate future health impact
        future_health_impact = 0
        if smoking:
            future_health_impact += 2
        if alcohol_frequency > 2:
            future_health_impact += 1
        if exercise_frequency < 3:
            future_health_impact += 1

        response_data = {
            'chronological_age': chronological_age,
            'biological_age': round(biological_age, 1),
            'cognitive_age': round(cognitive_age, 1),
            'health_score': round(health_score, 1),
            'health_status': 'Good' if health_score >= 70 else 'Fair' if health_score >= 50 else 'Poor',
            'recommendations': [
                {
                    "category": "Weight Management",
                    "recommendation": f"Your BMI ({round(bmi, 1)}) indicates you're {bmi_category.lower()}. Consider maintaining a balanced diet.",
                    "impact": "High" if bmi_category in ["Underweight", "Obese"] else "Medium" if bmi_category == "Overweight" else "Low"
                }
            ],
            'age_prediction': {
                'age_in_5_years': chronological_age + 5,
                'biological_age_in_5_years': round(biological_age + 5 + future_health_impact, 1),
                'potential_improvement': max(0, future_health_impact * 2)
            },
            'metrics': {
                'bmi': round(bmi, 1),
                'bmi_category': bmi_category,
                'exercise_level': 'Active' if exercise_frequency >= 3 else 'Sedentary',
                'stress_impact': 'High' if stress_level > 7 else 'Medium' if stress_level > 4 else 'Low',
                'sleep_quality': 'Good' if 7 <= sleep_hours <= 9 else 'Poor'
            }
        }
        
        print(f"Sending response: {response_data}")
        return jsonify(response_data)

    except Exception as e:
        print(f"Error in calculate_age: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
