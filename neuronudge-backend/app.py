from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/nudge', methods=['POST'])
def get_nudge():
    data = request.json
    task = data.get("task", "")
    profile = data.get("profile", "ADHD")
    energy = data.get("energy", "medium")

    prompt = f"""
You are an executive function coach helping a neurodivergent adult ({profile} profile, energy level: {energy}) complete this task: "{task}".

1. Break it into 3-5 friendly, bite-sized steps.
2. Keep language simple, motivating, and non-judgmental.
3. End with an encouraging message.

Response format:
Step-by-step plan:
1. ...
2. ...
3. ...
Encouragement: ...
"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": prompt}],
            temperature=0.7,
            max_tokens=300
        )
        output = response.choices[0].message["content"]
        return jsonify({"response": output})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/log', methods=['POST'])
def log_session():
    print("LOG:", request.json)
    return jsonify({"status": "logged"}), 200

if __name__ == '__main__':
    app.run(debug=True)
