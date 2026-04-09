 Netizens AI
Resume Analyzer + Instant Portfolio Generator
<div align="center">

Analyze your resume, get ATS score, find skill gaps, and generate a portfolio — in seconds.

 Fast ·  Smart ·  Beautiful UI

</div>
✨ What It Does
📄 AI Resume Analysis — Understands your resume like a recruiter
📊 ATS Score — Checks keyword optimization & formatting
🧠 Skill Detection — Extracts your technical & soft skills
⚠️ Keyword Gaps — Shows what you’re missing
💡 Smart Suggestions — Actionable improvements
🎨 Auto Portfolio (coming soon) — Turn resume into a shareable site
🖥️ Preview
Home	Upload	Dashboard
Animated hero UI	Drag & drop upload	Scores + insights
⚙️ Tech Stack

Frontend

React + Vite
React Router
CSS (Glassmorphism + animations)

Backend

Python + Flask
pdfplumber, python-docx

AI

Google Gemini 1.5 Flash
🚀 Quick Start
1. Clone
git clone https://github.com/Nehaaa191/Netizens.git
cd Netizens
2. Frontend
cd frontend
npm install
npm run dev
3. Backend
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
4. Add API Key

Create .env inside backend/:

GOOGLE_API_KEY=your_key_here
5. Run Server
python app.py
🔄 How It Works
Upload Resume → Extract Text → Gemini AI Analysis → JSON Response → Dashboard UI
📡 API
GET /health

Check if server is running

POST /upload

Upload resume → get analysis

🎯 Roadmap
 Resume analysis + ATS score
 Skill gap detection
 Portfolio generator
 PDF report export
 Job description matcher
 Auth + deployment
🛠️ Common Issues
❌ No text detected → Use selectable PDF
❌ CORS error → Ports must match (5173 & 5000)
❌ API error → Check .env file
🙌 Credits
Google Gemini AI
pdfplumber
React + Vite
<div align="center">

💜 Built for hackathons by Netizens
⭐ Star this repo if you like it!

</div>