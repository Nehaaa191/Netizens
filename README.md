# 🚀 Netizens — AI Resume Analyzer & Instant Portfolio Generator  

Analyze your resume, get ATS insights, detect skill gaps, and generate a portfolio — all in seconds.

🔗 **Link:** https://netizens-six.vercel.app/

---

## ✨ Overview  

**Netizens** is an AI-powered platform that evaluates your resume like a recruiter would. It provides actionable insights, improves ATS compatibility, and (soon) transforms your resume into a stunning personal portfolio.

Fast. Smart. Beautiful.

---

## 🌟 Features  

### 📄 AI Resume Analysis  
Understands your resume contextually using advanced AI.

### 📊 ATS Score  
Evaluates formatting, keywords, and optimization for Applicant Tracking Systems.

### 🧠 Skill Detection  
Automatically extracts both technical and soft skills.

### ⚠️ Keyword Gap Analysis  
Identifies missing keywords to improve job matching.

### 💡 Smart Suggestions  
Provides clear, actionable recommendations to enhance your resume.

### 🎨 Auto Portfolio *(Coming Soon)*  
Generate a personal portfolio website directly from your resume.

---

## 🖥️ UI Highlights  

- Animated hero section  
- Clean glassmorphism design  
- Drag & drop resume upload  
- Interactive dashboard with insights  
- Real-time feedback visualization  

---

## ⚙️ Tech Stack  

### 🎨 Frontend  
- React + Vite  
- React Router  
- CSS (Glassmorphism + Animations)  

### 🔧 Backend  
- Python + Flask  
- pdfplumber  
- python-docx  

### 🤖 AI  
- Google Gemini 1.5 Flash  

---

## 🚀 Quick Start  

### 1. Clone the Repository  
```bash
git clone https://github.com/Nehaaa191/Netizens.git
cd Netizens
```

### 2. Setup Frontend  
```bash
cd frontend
npm install
npm run dev
```

### 3. Setup Backend  
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 4. Add API Key  
Create a `.env` file inside `/backend`:

```env
GOOGLE_API_KEY=your_key_here
```

### 5. Run Backend Server  
```bash
python app.py
```

---

## 🔄 How It Works  

Upload Resume → Extract Text → AI Analysis → JSON Response → Dashboard Insights  

---

## 📡 API Endpoints  

### `GET /health`  
Check if the server is running  

### `POST /upload`  
Upload resume and receive AI analysis  

---

## 🎯 Roadmap  

- ✅ Resume analysis + ATS scoring  
- ✅ Skill gap detection  
- 🔄 Portfolio generator  
- 🔄 PDF report export  
- 🔄 Job description matcher  
- 🔄 Authentication & deployment  

---

## 🛠️ Common Issues  

❌ **No text detected** → Use a selectable (not scanned) PDF  
❌ **CORS error** → Ensure ports match (Frontend: 5173, Backend: 5000)  
❌ **API error** → Verify `.env` configuration  

---

## 💜 Built by Netizens  

If you found this useful, consider ⭐ starring the repo!