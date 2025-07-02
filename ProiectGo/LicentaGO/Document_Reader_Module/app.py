from flask import Flask, request, jsonify
import os
from extract_kpis import extract_kpis_from_pdf

app = Flask(__name__)

# Helper function to save the uploaded PDF temporarily
def save_pdf(file):
    file_path = os.path.join('/tmp', file.filename)
    file.save(file_path)
    return file_path

# Full extraction (extract all KPIs)
@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'pdf' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['pdf']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = save_pdf(file)

    try:
        # Extract all KPIs
        kpis = extract_kpis_from_pdf(file_path)
        return jsonify(kpis)  # Return all KPIs
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(file_path)

# Individual extraction (specific KPIs)
@app.route('/extract/er', methods=['POST'])
def extract_er():
    return extract_single_kpi('ER')

@app.route('/extract/pr', methods=['POST'])
def extract_pr():
    return extract_single_kpi('PR')

@app.route('/extract/her2', methods=['POST'])
def extract_her2():
    return extract_single_kpi('HER2')

@app.route('/extract/ki67', methods=['POST'])
def extract_ki67():
    return extract_single_kpi('Ki-67')

# Helper function to extract a specific KPI
def extract_single_kpi(kpi_name):
    if 'pdf' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['pdf']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = save_pdf(file)

    try:
        # Extract all KPIs, but return only the requested one
        kpis = extract_kpis_from_pdf(file_path)
        return jsonify({kpi_name: kpis[kpi_name]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(file_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8085)
