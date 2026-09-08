# ♻️ EcoSort — Smart Waste Management System

A full-stack educational project for AI-assisted waste classification and waste-record analytics.

## Features
- React + Vite responsive dashboard
- Flask REST API
- SQLite database
- Rule-based AI-style classifier with confidence score
- Waste distribution charts
- Classification history and deletion
- Disposal/recycling recommendations
- Frontend and backend in one repository

## Run locally

### 1. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
API: `http://127.0.0.1:5000`

### 2. Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal.


## Note
The classifier is a lightweight demonstration model based on keyword rules. It is not a real-world waste-disposal authority or environmental compliance system.
