# diet_api.py
import math
import random
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flasgger import Swagger
from flask_cors import CORS   # 👈 Added for CORS
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# -----------------------------
# Config / constants
# -----------------------------
random.seed(42)
np.random.seed(42)

ACTIVITY_LEVELS = ["Sedentary", "Light", "Moderate", "Active"]
DIABETES_CHOICES = ["Yes", "No"]
HYPERTENSION_CHOICES = ["Yes", "No"]
DIET_PLANS = ["Balanced", "Low-Carb", "Low-Fat", "High-Protein", "Keto"]

# -----------------------------
# Helper: deterministic label assignment (rule-based)
# -----------------------------
def assign_diet_plan(age, bmi, activity, diabetes, hypertension, noise_scale=0.25):
    activity = str(activity).strip().capitalize()
    diabetes = "Yes" if str(diabetes).lower() in ("true", "yes", "y", "1") else "No"
    hypertension = "Yes" if str(hypertension).lower() in ("true", "yes", "y", "1") else "No"

    scores = {plan: 0.0 for plan in DIET_PLANS}

    if diabetes == "Yes":
        scores["Low-Carb"] += 2.0
        scores["Keto"] += 1.5
        scores["Low-Fat"] += 0.5

    if hypertension == "Yes":
        scores["Low-Fat"] += 2.0
        scores["Balanced"] += 0.5

    if activity == "Active":
        scores["High-Protein"] += 2.0
        scores["Balanced"] += 0.5
    elif activity == "Moderate":
        scores["Balanced"] += 1.0
        scores["High-Protein"] += 0.8
    elif activity == "Light":
        scores["Balanced"] += 0.5
    elif activity == "Sedentary":
        scores["Balanced"] += 0.2

    if bmi >= 30:
        scores["Low-Carb"] += 1.5
        scores["Low-Fat"] += 1.0
        scores["Keto"] += 0.6
    elif 25 <= bmi < 30:
        scores["Low-Carb"] += 1.0
        scores["Balanced"] += 0.5
    elif 18.5 <= bmi < 25:
        scores["Balanced"] += 1.0
    else:
        scores["High-Protein"] += 2.0

    if age >= 60:
        scores["Balanced"] += 1.0
    elif age < 25:
        scores["High-Protein"] += 0.5

    for k in scores:
        scores[k] += random.gauss(0, noise_scale)

    selected = max(scores.items(), key=lambda x: x[1])[0]
    return selected

# -----------------------------
# Generate synthetic dataset
# -----------------------------
def generate_dataset(n_rows=5000):
    rows = []
    for _ in range(n_rows):
        age = random.randint(18, 75)
        bmi = round(random.uniform(16, 40), 1)
        activity = random.choice(ACTIVITY_LEVELS)
        diabetes = random.choices(DIABETES_CHOICES, weights=[0.12, 0.88])[0]
        hypertension = random.choices(HYPERTENSION_CHOICES, weights=[0.18, 0.82])[0]
        diet = assign_diet_plan(age, bmi, activity, diabetes, hypertension)
        rows.append({
            "Age": age,
            "BMI": bmi,
            "ActivityLevel": activity,
            "Diabetes": diabetes,
            "Hypertension": hypertension,
            "DietPlan": diet
        })
    return pd.DataFrame(rows)

df = generate_dataset(n_rows=5000)

# -----------------------------
# Encode & train
# -----------------------------
X = df.drop("DietPlan", axis=1)
y = df["DietPlan"]

le_activity = LabelEncoder().fit(X["ActivityLevel"])
le_diabetes = LabelEncoder().fit(X["Diabetes"])
le_hypertension = LabelEncoder().fit(X["Hypertension"])

X_enc = X.copy()
X_enc["ActivityLevel"] = le_activity.transform(X_enc["ActivityLevel"])
X_enc["Diabetes"] = le_diabetes.transform(X_enc["Diabetes"])
X_enc["Hypertension"] = le_hypertension.transform(X_enc["Hypertension"])

X_train, X_test, y_train, y_test = train_test_split(
    X_enc, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
report_dict = classification_report(y_test, y_pred, output_dict=True)

print("Model trained. Test accuracy:", round(acc, 4))
print("Class counts (train):")
print(y_train.value_counts().to_dict())

# -----------------------------
# Flask app + Swagger + CORS
# -----------------------------
app = Flask(__name__)
swagger = Swagger(app)

# 👇 Allow CORS for frontend
CORS(app, origins=["http://localhost:5173"])

def normalize_activity_input(val):
    if val is None:
        return None
    s = str(val).strip().lower()
    for act in ACTIVITY_LEVELS:
        if s == act.lower() or s == act.lower().replace("-", " "):
            return act
    if s.startswith("s"):
        return "Sedentary"
    if s.startswith("l"):
        return "Light"
    if s.startswith("m"):
        return "Moderate"
    if s.startswith("a"):
        return "Active"
    return None

def normalize_bool_to_yesno(val):
    if isinstance(val, bool):
        return "Yes" if val else "No"
    s = str(val).strip().lower()
    if s in ("true", "yes", "y", "1"):
        return "Yes"
    if s in ("false", "no", "n", "0"):
        return "No"
    return "No"

@app.route("/")
def root():
    return jsonify({"message": "Diet Predictor API (improved) is running."})

@app.route("/classes", methods=["GET"])
def classes():
    return jsonify({"diet_plans": DIET_PLANS})

@app.route("/metrics", methods=["GET"])
def metrics():
    return jsonify({
        "accuracy": acc,
        "classification_report": report_dict
    })

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    try:
        age = int(data.get("Age"))
        bmi = float(data.get("BMI"))
    except Exception:
        return jsonify({"error": "Age must be integer and BMI must be numeric."}), 400

    activity_raw = data.get("ActivityLevel")
    activity = normalize_activity_input(activity_raw)
    if activity is None:
        return jsonify({"error": f"ActivityLevel must be one of {ACTIVITY_LEVELS}. Got: {activity_raw}"}), 400

    diabetes_raw = data.get("Diabetes")
    hypertension_raw = data.get("Hypertension")

    diabetes = normalize_bool_to_yesno(diabetes_raw)
    hypertension = normalize_bool_to_yesno(hypertension_raw)

    try:
        activity_enc = le_activity.transform([activity])[0]
        diabetes_enc = le_diabetes.transform([diabetes])[0]
        hypertension_enc = le_hypertension.transform([hypertension])[0]
    except Exception as e:
        return jsonify({"error": "Encoding error: " + str(e)}), 400

    input_df = pd.DataFrame([{
        "Age": age,
        "BMI": bmi,
        "ActivityLevel": activity_enc,
        "Diabetes": diabetes_enc,
        "Hypertension": hypertension_enc
    }])

    pred = model.predict(input_df)[0]
    probs = model.predict_proba(input_df)[0]
    prob_map = {cls: float(prob) for cls, prob in zip(model.classes_, probs)}

    return jsonify({
        "RecommendedDietPlan": pred,
        "Probabilities": prob_map
    })

if __name__ == "__main__":
    print("Starting Diet Predictor API (improved). Swagger docs at /apidocs/")
    print(f"Test accuracy on held-out set: {acc:.4f}")
    app.run(debug=True, port=8485)