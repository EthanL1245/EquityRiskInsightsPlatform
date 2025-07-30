# EquityRiskInsightsPlatform

## How to Run the Project

### Prerequisites
- Node.js (v16 or later)
- npm (v7 or later)
- Python (v3.8 or later)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend/fastapi_service
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   ./venv/Scripts/activate
   ```
   If you encounter issues on Windows, run the following command to bypass execution policy restrictions:
   ```powershell
   powershell -ExecutionPolicy Bypass
   ```
3. Install Python dependencies:
   ```bash
   pip install -r backend/fastapi_service/requirements.txt
   ```
4. Start the FastAPI server on port 8001:
   ```bash
   uvicorn main:app --reload --port 8001
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/react_dashboard
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### Access the Application
- Open your browser and navigate to `http://localhost:3000` to access the frontend.
- The backend API will be available at `http://127.0.0.1:8001`.

### Notes
- Ensure both the backend and frontend servers are running simultaneously.
- Update `.env` files if required for custom configurations.