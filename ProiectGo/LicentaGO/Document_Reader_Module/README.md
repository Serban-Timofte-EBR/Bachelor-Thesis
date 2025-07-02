Document KPI Extraction API
This project provides a Flask-based API that extracts specific Key Performance Indicators (KPIs)
from a PDF file,
specifically for breast cancer-related medical reports. The extracted KPIs include:
- ER (Estrogen Receptor)
- PR (Progesterone Receptor)
- HER2
- Ki-67
- BRCA 1/2
- PD-L1
- MSI
- TMB
- NTRK

The API offers endpoints to extract all KPIs at once or individual KPIs as needed.
## Features
- Extracts multiple KPIs from medical reports.
- Can extract values such as percentages, Positive/Negative results, or specific metrics.
- Offers both a full extraction endpoint and individual KPI extraction endpoints.
- Easy integration with a front-end application.
## Endpoints
### 1. Extract All KPIs
URL: /upload
Method: POST
Description: This endpoint extracts all KPIs from an uploaded PDF.
Request Body:
- pdf (form-data): The medical report PDF file.
Response:
{ "BRCA": "Negative", "ER": "80%", "HER2": "Positive", "Ki-67": "45%", "MSI": "Stable", "NTRK": "Not
Found", "PD-L1": "10%", "PR": "75%", "TMB": "3" }
### 2. Extract Specific KPI
URL: /extract/<kpi>
Method: POST
Description: This endpoint extracts only the specified KPI from the uploaded PDF. Replace <kpi>
with the specific KPI you want to extract (e.g., er, pr, her2).
Request Body:
- pdf (form-data): The medical report PDF file.
Response Example for /extract/er:
{ "ER": "80%" }
## Installation
### Prerequisites
- Python 3.9+
- Docker (optional but recommended)
- Git
### Running Locally
1. Clone the repository:
git clone <your-github-repo-url>
cd Document-KPI-Extraction-API
2. Install dependencies:
pip install -r requirements.txt
3. Run the Flask app:
python app.py
4. The API will be available at http://localhost:5000.
### Running with Docker
1. Build the Docker container:
docker-compose up --build
2. The API will be available at http://localhost:5000.
## Usage
You can test the API with tools like Postman or curl.
Example using curl to extract all KPIs:
curl -X POST -F 'pdf=@/path/to/your/pdf.pdf' http://localhost:5000/upload
Example using curl to extract only ER:
curl -X POST -F 'pdf=@/path/to/your/pdf.pdf' http://localhost:5000/extract/er
## Front-End Integration
You can integrate this API with a front-end built with React (or any other framework) by making
POST requests to the endpoints and processing the JSON responses.
## Contribution
Feel free to submit pull requests or open issues to improve the project!
## License
This project is licensed under the MIT License.