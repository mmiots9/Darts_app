#!/usr/bin/env python

# IMPORTS
from flask import Flask, render_template, url_for, request, jsonify

# CREATE APP OBJECT
app = Flask(__name__)

@app.route("/")
def index():
    return "hi"

@app.route("/training-501")
def training_501():
    return render_template('training-501.html')

@app.route('/training-501/results', methods=['POST', 'GET'])
def process_qt_calculation():
  if request.method == "POST":
    global training501_results
    training501_results = request.get_json()
    print(training501_results)
 
    results = {'processed': 'true'}
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug = True)