from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv
import math

load_dotenv()

app = Flask(__name__)
CORS(app)

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
