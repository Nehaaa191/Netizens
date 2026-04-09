# 📡 Netizens API Documentation

Welcome to the official API reference for
**Netizens — AI Resume Analyzer & Instant Portfolio Generator**

🔗 **Live Application:** https://netizens-six.vercel.app/

---

## ✨ Overview

Netizens provides an **AI-powered resume analysis engine** designed to evaluate resumes the way recruiters and ATS systems do.

It helps users:

* 📊 Measure ATS compatibility
* 🧠 Extract key skills
* ⚠️ Identify missing keywords
* 🎯 Generate actionable improvement suggestions

**Core Principles:**
⚡ Fast • 🧠 Intelligent • 🎯 Practical

---

## 🔗 Base URLs

### 🧪 Local Development

```bash
http://localhost:5000
```

### 🌐 Production (Frontend)

```bash
https://netizens-six.vercel.app/
```

> ⚠️ **Note:** Backend APIs are typically accessed via a locally running server unless separately deployed.

---

## 🧠 Processing Flow

```bash
Upload Resume
   ↓
Text Extraction
   ↓
AI Processing (Gemini)
   ↓
Structured JSON Response
   ↓
Dashboard Insights
```

---

## 🚀 API Endpoints

---

### 🔹 1. Health Check

#### 📍 Endpoint

```bash
GET /health
```

#### 📖 Description

Checks if the backend server is up and running.

#### ✅ Response

```json
{
  "status": "ok"
}
```

---

### 🔹 2. Resume Upload & Analysis

#### 📍 Endpoint

```bash
POST /upload
```

#### 📖 Description

Uploads a resume file and returns a structured AI-powered analysis including:

* ATS Score
* Extracted Skills
* Missing Keywords
* Improvement Suggestions

---

## 📥 Request Specification

### 🔸 Headers

```bash
Content-Type: multipart/form-data
```

### 🔸 Body Parameters

* **file** (required)
  Resume file in **PDF or DOCX format**

---

## 📤 Response Structure

```json
{
  "ats_score": 85,
  "skills": ["React", "Python", "Machine Learning"],
  "missing_keywords": ["Docker", "CI/CD"],
  "suggestions": [
    "Improve formatting consistency",
    "Add measurable achievements",
    "Include more action verbs"
  ]
}
```

---

## ⚠️ Error Handling

### ❌ Invalid File Format

```json
{
  "error": "Invalid file format"
}
```

### ❌ No Text Extracted

```json
{
  "error": "No text extracted from resume"
}
```

### ❌ Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## 🧪 Example Request (cURL)

```bash
curl -X POST http://localhost:5000/upload \
  -F "file=@resume.pdf"
```

---

## 🛠️ Tech Stack

* **Backend Framework:** Flask (Python)
* **Text Extraction:** pdfplumber, python-docx
* **AI Engine:** Google Gemini 1.5 Flash

---

## 📌 Important Notes

* Only **PDF** and **DOCX** formats are supported
* Resume must contain **selectable text** (no scanned images)
* API key must be configured in the `.env` file
* Processing time depends on file size and content

---

## 🔄 Future Enhancements

* 📄 Portfolio generation endpoint
* 📊 PDF report export
* 🎯 Job description matching
* 🔐 Authentication & user sessions

---

## 💜 Maintained by Netizens

Built with passion to simplify resume analysis using AI.

If you found this useful, consider ⭐ starring the repository!
